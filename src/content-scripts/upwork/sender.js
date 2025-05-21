import * as Callbacks from '../../services/helpers/contentScript';

console.log('In Sender Content script...');

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
