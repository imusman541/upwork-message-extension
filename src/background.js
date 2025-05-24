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
    } else if (request.callback === 'stop-the-script') {
      (async () => {
        try {
          const isEnabled = await getLocal('extension-enabled');
          if (isEnabled) {
            await setLocal('extension-enabled', false);
            chrome.tabs.query({}, async (tabs) => {
              const pinnedTabs = tabs.filter(tab => tab.pinned);
  
              if (pinnedTabs?.length) {
                for (const tab of pinnedTabs) {
                  const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
                  const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');
                  if (tab.url.includes(senderCompanyReferenceId) || tab.url.includes(recieverCompanyReferenceId)) {
                    chrome.tabs.reload(tab.id);
                  }
                }
              }
            });
          }
          sendResponse({
            success: true
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
          chrome.tabs.query({}, async (tabs) => {
            const pinnedTabs = tabs.filter(tab => tab.pinned);

            if (pinnedTabs?.length) {
              for (const tab of pinnedTabs) {
                const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
                const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');

                if (tab.url.includes(senderCompanyReferenceId)) {
                  chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['upwork_sender_script.bundle.js']
                  });
                } else if (tab.url.includes(recieverCompanyReferenceId)) {
                  chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['upwork_reciever_script.bundle.js']
                  });
                }
              }
            }
          });
          sendResponse({
            success: true
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
