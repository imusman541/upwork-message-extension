import { createRoot } from 'react-dom/client';

import Connect from '../../components/upwork/connect-sender';
import { getLocal, setLocal } from '../dbService';
import { sleep } from '../utils';

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

const SaveSenderMessagesInStorage = async () => {
  await waitForSelector(document, 'a[data-test="room-list-item"]');
  const upworkCustomers = document.querySelectorAll('a[data-test="room-list-item"]');
  console.log('\n upworkCustomers', upworkCustomers.length);

  const saveMessagesForCustomer = [];
  for (let i = 0; i < upworkCustomers.length; i += 1) {
    const customer = upworkCustomers[i];
    const senderRoomId = customer.getAttribute('id');
    const alreadyMapped = await getLocal(senderRoomId);
    if (alreadyMapped) {
      saveMessagesForCustomer.push(customer);
    }
  }

  console.log('\n saveMessagesForCustomer', saveMessagesForCustomer);
  for (let i = 0; i < saveMessagesForCustomer.length; i += 1) {
    const senderRoomId = saveMessagesForCustomer[i].getAttribute('id');
    let newMessagesCount = saveMessagesForCustomer[i].querySelector('div[class*="item-indicators"]')?.innerText;
    console.log('\n newMessagesCount', newMessagesCount);
    if (newMessagesCount) {
      newMessagesCount = Number(newMessagesCount);
      console.log('\n newMessagesCount', newMessagesCount);
      saveMessagesForCustomer[i].click();
      await sleep(2);
      await waitForSelector(document, 'div[class="desktop-room"]');

      const desktopRoom = document.querySelector('div[class="desktop-room"]');
      const allMessages = desktopRoom.querySelectorAll('div[class="up-d-message"]');
      const allMessagesDiv = [...allMessages];
      console.log('\n allMessagesDiv', allMessagesDiv.length);
      let lastMessages = allMessagesDiv.slice(-newMessagesCount);
      lastMessages = lastMessages.map((obj) => obj.innerText);
      console.log('\n lastMessages', lastMessages);
      if (lastMessages.length) {
        await setLocal(`sender-messages-${senderRoomId}`, lastMessages);
      }
    } else {
      console.log('\n No new messages');
    }
  }
};

const SendSenderMessagesToReciever = async (recieverRoom, recieverRoomId) => {
  try {
    const senderRoomId = await getLocal(recieverRoomId);
    const senderMessages = await getLocal(`sender-messages-${senderRoomId}`);
    if (senderMessages?.length) {
      console.log('\n senderMessages', senderMessages);
      recieverRoom.click();
      await sleep(2);
  
      const desktopRoom = document.querySelector('div[class="desktop-room"]');
      for (let i = 0; i < senderMessages.length; i += 1) {
        await sleep(2);

        const message = senderMessages[i];
        console.log('\n message', message);
        const input = desktopRoom.querySelector('div.input-area').querySelector('p');
        desktopRoom.querySelector('div.input-area').querySelector('p').innerText = message;

        await sleep(1);

        if (input) {
          console.log('\n enter event');
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
          });
  
          input.dispatchEvent(event);
        } else {
          console.log('\n input not found');
        }
      }
    }

    await setLocal(`sender-messages-${senderRoomId}`, []);
  } catch (error) {
    alert(error.message);
  }
};

const UpworkSender = async () => {
  try {
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
  
    await SaveSenderMessagesInStorage();
  } catch (error) {
    alert(error.message);
  }
};

const UpworkReciever = async () => {
  try {
    console.log('\n Upwork Reciever Script is going to run');
    await waitForSelector(document, 'a[data-test="room-list-item"]');
    const upworkRecievers = document.querySelectorAll('a[data-test="room-list-item"]:not([articlecovered])');
    console.log('\n upworkRecievers', upworkRecievers.length);
  
    const recieverRoomIds = [];
    const roomIds = [];
    for (let i = 0; i < upworkRecievers.length; i += 1) {
      const recieverRoomId = upworkRecievers[i].getAttribute('id');
      const roomName = upworkRecievers[i].querySelector('div.header-row').querySelector('h4').innerText;
  
      const alreadyMapped = await getLocal(recieverRoomId);
      if (!alreadyMapped) {
        recieverRoomIds.push({
          value: recieverRoomId,
          label: roomName
        });
      } else {
        roomIds.push({
          room: upworkRecievers[i],
          recieverRoomId
        });
      }
    }
  
    console.log('\n recieverRoomIds', recieverRoomIds);
    if (recieverRoomIds.length) {
      await setLocal('reciever-room-ids', recieverRoomIds);
    } else {
      await setLocal('reciever-room-ids', []);
    }
  
    for (let i = 0; i < roomIds.length; i += 1) {
      await SendSenderMessagesToReciever(roomIds[i].room, roomIds[i].recieverRoomId);
    }
  } catch (error) {
    alert(error.message);
  }
};

const SenderScript = async () => {
  try {
    const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
    const extensionEnabled = await getLocal('extension-enabled');

    if (extensionEnabled) {
      const currentUrl = document.location.href;
      if (currentUrl.includes(senderCompanyReferenceId)) {
        const senderItervalId = await getLocal('sender-interval-id');
        if (senderItervalId) {
          clearInterval(senderItervalId);
          await setLocal('sender-interval-id', null);
          await sleep(2);
        }
        const intervalId = setInterval(async () => {
          await UpworkSender();
        }, 5000);

        console.log('\n sender intervalId', intervalId);
        await setLocal('sender-interval-id', intervalId);
      }
    } else {
      console.log('\n Upwork Message Extension is not enabled');
    }
  } catch (error) {
    alert(error.message);
  }
};

const RecieverScript = async () => {
  try {
    const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');
    const extensionEnabled = await getLocal('extension-enabled');

    if (extensionEnabled) {
      const currentUrl = document.location.href;
      if (currentUrl.includes(recieverCompanyReferenceId)) {
        const recieverItervalId = await getLocal('reciever-interval-id');
        if (recieverItervalId) {
          clearInterval(recieverItervalId);
          await setLocal('reciever-interval-id', null);
          await sleep(2);
        }

        const intervalId = setInterval(async () => {
          await UpworkReciever();
        }, 5000);

        await setLocal('reciever-interval-id', intervalId);
      }
    } else {
      console.log('\n Upwork Message Extension is not enabled');
    }
  } catch (error) {
    alert(error.message);
  }
};

export {
  updateTitle,
  SenderScript,
  RecieverScript,
  UpworkSender,
  UpworkReciever
};
