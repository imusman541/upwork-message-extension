import { createRoot } from 'react-dom/client';

import Connect from '../../components/upwork/connect-sender';
import { getLocal, setLocal } from '../dbService';

const waitForSelector = async (document, element) => new Promise((resolve) => {
  let selector;
  let setTimeoutIntervalId = '';
  const setIntervalId = setInterval(() => {
    selector = document.querySelector(element);
    if (selector) {
      clearTimeout(setTimeoutIntervalId);
      clearInterval(setIntervalId);
      resolve(selector);
    }
  }, 1000);

  setTimeoutIntervalId = setTimeout(async () => {
    clearInterval(setIntervalId);
    resolve(selector);
  }, 15000);
});

const updateTitle = () => {
  document.title = 'chrome extension installed';
};

const UpworkSender = async () => {
  console.log('\n Upwork Sender Script is going to run');
  await waitForSelector(document, 'a[data-test="room-list-item"]');
  const upworkCustomers = document.querySelectorAll('a[data-test="room-list-item"]:not([articlecovered])');
  console.log('\n upworkCustomers', upworkCustomers.length);

  for (let i = 0; i < upworkCustomers.length; i += 1) {
    upworkCustomers[i]?.setAttribute('articleCovered', true);

    const newDiv = document.createElement('div');
    newDiv.id = 'main-product-info-div';

    const root = createRoot(newDiv);
    root.render(<Connect senderRoomId={upworkCustomers[i].getAttribute('id')}/>);

    upworkCustomers[i].appendChild(newDiv);
    upworkCustomers[i].parentNode.insertBefore(newDiv, upworkCustomers[i].nextSibling);
  }
};

const UpworkReciever = async () => {
  console.log('\n Upwork Reciever Script is going to run');
  await waitForSelector(document, 'a[data-test="room-list-item"]');
  const upworkRecievers = document.querySelectorAll('a[data-test="room-list-item"]:not([articlecovered])');
  console.log('\n upworkRecievers', upworkRecievers.length);

  const recieverRoomIds = [];
  for (let i = 0; i < upworkRecievers.length; i += 1) {
    const recieverRoomId = upworkRecievers[i].getAttribute('id');
    const roomName = upworkRecievers[i].querySelector('div.header-row').querySelector('h4').innerText;

    const alreadyMapped = await getLocal(recieverRoomId);
    if (!alreadyMapped) {
      recieverRoomIds.push({
        value: recieverRoomId,
        label: roomName
      });
    }
  }

  console.log('\n recieverRoomIds', recieverRoomIds);
  if (recieverRoomIds.length) {
    await setLocal('reciever-room-ids', recieverRoomIds);
  } else {
    await setLocal('reciever-room-ids', []);
  }
};

const SenderRecieverScript = async () => {
  const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
  const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');

  const currentUrl = document.location.href;
  if (currentUrl.includes(senderCompanyReferenceId)) {
    await UpworkSender();
  } else if (currentUrl.includes(recieverCompanyReferenceId)) {
    await UpworkReciever();
  }
};

export {
  updateTitle,
  SenderRecieverScript,
  UpworkSender,
  UpworkReciever
};
