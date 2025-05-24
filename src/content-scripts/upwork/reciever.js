import * as Callbacks from '../../services/helpers/contentScript';
import { setLocal } from '../../services/dbService';

console.log('In Reciever Content script...');

window.addEventListener('beforeunload', async () => {
  chrome.runtime.sendMessage({
    payload: {},
    callback: 'stop-the-script'
  });
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
Callbacks.RecieverScript(document);
//   }
// };
