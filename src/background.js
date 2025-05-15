import { setLocal } from './services/dbService';
import { DEFAULT_COLLAGE_TEMPLATE, VERO_BRANDS } from './services/utils';

chrome.runtime.onInstalled.addListener(async () => {
  await setLocal('default-collage-template', DEFAULT_COLLAGE_TEMPLATE);
  await setLocal('product-hunter-settings', { isPrime: true, resultFetchLimit: 2 });
  await setLocal('run-script-status', '');
  await setLocal('offer-status', 'off');
  await setLocal('end-sell-similar-settings', {
    minimumSold: 0,
    minimumViews: 0,
    hoursLeft: 0
  });
  await setLocal('vero-brands', VERO_BRANDS);
  await setLocal('tracker-filters', {
    stockMonitorEnabled: false,
    priceMonitorEnabled: false,
    priceMonitorWithEndingPriceEnabled: false,
    stockMonitorType: '',
    priceMonitorType: 'markup',
    restockQuantity: 0,
    priceMarkupPercentage: 0,
    priceMarkupValue: 0,
    priceTriggerThreshold: 0,
    priceMonitorEndingPrices: ''
  });
  await setLocal('rule-based-settings', {
    itemWithNoSku: {
      status: false,
      action: 'nothing'
    },
    itemWithBrokenSku: {
      status: false,
      action: 'nothing'
    },
    itemsNotFoundOnAmazon: {
      status: false,
      action: 'nothing'
    },
    itemsWithSales: {
      status: false,
      action: 'delete',
      sales: 0,
      days: 0
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.callback === 'openTab') {
      (async () => {
        try {
          const res = await chrome.tabs.create(request.payload);
          sendResponse(res);
        } catch (error) {
          sendResponse({
            success: false,
            error: error.message
          });
        }
      })();
      return true;
    }
  } catch (e) {
    console.log(e);
  }

  return true;
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const { url } = tab;

  let originUrl = url;
  if (url && !url?.includes('www.ebay')) {
    const newURL = new URL(url);
    originUrl = newURL.origin;
  }

  if (changeInfo.status === 'complete') {
    if (originUrl.includes('www.upwork.')) {
      const regex = /https?:\/\/(www\.)?amazon\.(com|co\.uk)\/([A-Za-z0-9-]+\/)?(gp\/product|dp)\/[A-Z0-9]{10}(\/|\?|$)/;

      const isMatch = regex.test(url);
      if (isMatch) {
        console.log('\n going to run Amazon content script');

        // chrome.scripting.executeScript({
        //   target: { tabId },
        //   files: ['amazon_main_product.bundle.js']
        // });
      } else {
        console.log('\n not on the correct link');
      }
    } else {
      console.log('\n not on the correct store', originUrl);
    }
  }
});
