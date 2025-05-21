import { getLocal, setLocal } from './services/dbService';
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
    if (request.callback === 'fetch-image-response') {
      (async () => {
        try {
          const response = await fetch(request.payload.url);
          const blob = await response.blob();
          sendResponse({
            success: true,
            data: blob
          });
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
  // const { url, pinned } = tab;

  // if (changeInfo.status === 'complete') {
  //   if (url.includes('upwork.com/ab/messages/rooms') && pinned) {
  //     console.log('\n going to run Upwork content script');

  //     chrome.scripting.executeScript({
  //       target: { tabId },
  //       files: ['upwork_sender_reciever_script.bundle.js']
  //     });
  //   } else {
  //     console.log('\n not on the correct store', url);
  //   }
  // }
});

const processedTabs = {};
chrome.tabs.query({}, async (tabs) => {
  const pinnedTabs = tabs.filter(tab => tab.pinned);
  
  if (pinnedTabs?.length) {
    console.log('processedTabs:', processedTabs);
    console.log('Pinned tabs:', pinnedTabs);
    for (const tab of pinnedTabs) {
      if (processedTabs[tab.id]) continue;
      const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
      const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');
  
      if (tab.url.includes(senderCompanyReferenceId)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['upwork_sender_script.bundle.js']
        });
        processedTabs[tab.id] = true;
      } else if (tab.url.includes(recieverCompanyReferenceId)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['upwork_reciever_script.bundle.js']
        });
        processedTabs[tab.id] = true;
      } 
    }
  }
});

