import * as Callbacks from '../../services/helpers/contentScript';
import { setLocal } from '../../services/dbService';

console.log('In Sender Content script...');

window.addEventListener('beforeunload', async () => {
  await setLocal('extension-enabled', false);
});

chrome.runtime.onMessage.addListener((req) => {
  try {
    Callbacks[req.callback](req.payload);
  } catch (e) {
    console.log(e);
  }
  return true;
});

// document.onreadystatechange = async () => {
//   console.log('State', document.readyState);
//   if (document.readyState === 'complete') {
Callbacks.SenderScript(document);
//   }
// };
