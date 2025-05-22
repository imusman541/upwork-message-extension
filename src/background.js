import { getLocal, setLocal } from './services/dbService';

chrome.runtime.onInstalled.addListener(async () => {

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
    } else if (request.callback === 'start-the-script') {
      (async () => {
        try {
          const processedTabs = {};
          chrome.tabs.query({}, async (tabs) => {
            const pinnedTabs = tabs.filter(tab => tab.pinned);
            console.log('🚀 ~ :54 ~ pinnedTabs:', pinnedTabs);

            if (pinnedTabs?.length) {
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
          sendResponse({
            success: true,
            data: 'running'
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

// chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
//   const { url } = tab;
//   if (changeInfo.status === 'complete') {
//     console.log('\n changeInfo.status', tabId, changeInfo.status);
//     console.log('\n going to run Upwork content script');

//     const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
//     const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');

//     if (url.includes(senderCompanyReferenceId)) {
//       chrome.scripting.executeScript({
//         target: { tabId },
//         files: ['upwork_sender_script.bundle.js']
//       });
//     } else if (url.includes(recieverCompanyReferenceId)) {
//       chrome.scripting.executeScript({
//         target: { tabId },
//         files: ['upwork_reciever_script.bundle.js']
//       });
//     }
//   } else {
//     console.log('\n not on the correct store', tab);
//   }
// });

// const processedTabs = {};
// chrome.tabs.query({}, async (tabs) => {
//   const pinnedTabs = tabs.filter(tab => tab.pinned);
//   console.log('🚀 ~ :54 ~ pinnedTabs:', pinnedTabs);

//   if (pinnedTabs?.length) {
//     console.log('processedTabs:', processedTabs);
//     console.log('Pinned tabs:', pinnedTabs);
//     for (const tab of pinnedTabs) {
//       if (processedTabs[tab.id]) continue;
//       const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
//       const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');

//       if (tab.url.includes(senderCompanyReferenceId)) {
//         chrome.scripting.executeScript({
//           target: { tabId: tab.id },
//           files: ['upwork_sender_script.bundle.js']
//         });
//         processedTabs[tab.id] = true;
//       } else if (tab.url.includes(recieverCompanyReferenceId)) {
//         chrome.scripting.executeScript({
//           target: { tabId: tab.id },
//           files: ['upwork_reciever_script.bundle.js']
//         });
//         processedTabs[tab.id] = true;
//       }
//     }
//   }
// });

