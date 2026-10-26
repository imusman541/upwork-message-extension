/* eslint-disable no-constant-condition */
import { createRoot } from 'react-dom/client';

import Connect from '../../components/upwork/connect-sender';
import { getLocal, setLocal } from '../dbService';
import { sleep } from '../utils';
import { extend, isEmpty, isEqual } from 'lodash';

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

const SaveSenderMessagesInStorage = async (scrollTheChat) => {
  await waitForSelector(document, 'a[data-test="room-list-item"]');

  let saveMessagesForCustomer = [];
  const numberOfRoomsToCheckLocal = await getLocal('number-of-rooms-to-check');
  if (scrollTheChat && numberOfRoomsToCheckLocal > 15) {
    for (let i = 0; i < 4; i += 1) {
      document.querySelectorAll('*').forEach(el => {
        if (el.scrollHeight > el.clientHeight) {
          el.scrollBy({ top: 3600, behavior: 'smooth' });
        }
      });
      await sleep(3);
    }
  }

  const upworkCustomers = document.querySelectorAll('a[data-test="room-list-item"]');
  for (let i = 0; i < upworkCustomers.length; i += 1) {
    const customer = upworkCustomers[i];
    const senderRoomId = customer.getAttribute('id');
    const alreadyMapped = await getLocal(senderRoomId);
    if (alreadyMapped) {
      saveMessagesForCustomer.push(customer);
    }
  }

  const delayPerRoomStart = await getLocal('delay-per-room-start');
  const delayPerRoomEnd = await getLocal('delay-per-room-end');
  const randomDelay = getRandomInRange(delayPerRoomStart, delayPerRoomEnd);
  
  saveMessagesForCustomer = saveMessagesForCustomer.slice(0, numberOfRoomsToCheckLocal || 3);
  for (let i = 0; i < saveMessagesForCustomer.length; i += 1) {
    const senderRoomId = saveMessagesForCustomer[i].getAttribute('id');
    let editedMessage = await getLocal(`edited-messages-${senderRoomId}`) || '';
    console.log('🚀 ~ :66 ~ SaveSenderMessagesInStorage ~ editedMessage:', editedMessage);
    saveMessagesForCustomer[i].click();
    await sleep(3);

    await waitForSelector(document, 'div[class="desktop-room"]');

    const desktopRoom = document.querySelector('div[class="desktop-room"]');
    let allMessagesSections = desktopRoom.querySelectorAll('div[class*="story-inner"]');
    allMessagesSections = [...allMessagesSections];
    const reversedIndex = [...allMessagesSections]?.reverse()?.findIndex(obj => obj?.classList?.contains('is-favorite-story'));

    if (reversedIndex === -1) continue;

    const lastIndex = (allMessagesSections.length - 1 - reversedIndex) - 1;
    console.log('🚀 ~ :72 ~ lastIndex:', lastIndex);
    allMessagesSections = allMessagesSections?.slice(lastIndex + 1);
    console.log('🚀 ~ :74 ~ allMessagesSections:', allMessagesSections);
    const allMessagesDiv = [];

    if (allMessagesSections?.length) {
      let textMessage = allMessagesSections[0].querySelector('div[class*="up-d-message"]');
      if (textMessage?.classList?.contains('edited')) {
        textMessage = textMessage?.innerText;
        if (!editedMessage.includes(textMessage)) {
          textMessage = textMessage + ' (edited)';
        } else {
          const lastIndexAgain = (allMessagesSections.length - 1 - reversedIndex);
          allMessagesSections = allMessagesSections?.slice(lastIndexAgain + 1);
        }
      } else {
        const lastIndexAgain = (allMessagesSections.length - 1 - reversedIndex);
        allMessagesSections = allMessagesSections?.slice(lastIndexAgain + 1);
      }
    }

    console.log('\n allMessagesSections again', allMessagesSections);
    for (let i = 0; i < allMessagesSections.length; i += 1) {
      const messageSection = allMessagesSections[i];
      let textMessage = messageSection.querySelector('div[class*="up-d-message"]');
      if (textMessage?.classList?.contains('edited')) {
        textMessage = textMessage?.innerText;
        if (!editedMessage.includes(textMessage)) {
          editedMessage = textMessage;
          textMessage = textMessage + ' (edited)';
        } else {
          continue;
        }
      } else {
        textMessage = textMessage?.innerText;
      }

      console.log('🚀 ~ :115 ~ SaveSenderMessagesInStorage ~ textMessage:', textMessage);

      if (textMessage?.startsWith('NTF')
        || textMessage?.toLowerCase()?.includes('removed this message')
        || textMessage?.toLowerCase()?.includes('to the room')
        || textMessage?.toLowerCase()?.includes('left the room')) continue;

      const message = {};

      if (textMessage) {
        extend(message, {
          message: textMessage
        });
      }
      const attachments = [];

      const isAttachment = messageSection.querySelector('.files-toggle');
      if (isAttachment) {
        let multipleFiles = messageSection.querySelectorAll('div[class="up-d-story-reference"]');
        multipleFiles = [...multipleFiles];
        const fileSpans = multipleFiles?.map((obj) => obj.querySelector('a[class*="up-n-link"]'));

        let fileSpan = [];
        if (fileSpans?.length) {
          fileSpan = [...fileSpans];
          const fileUrls = fileSpan?.map((obj) => obj?.href || '');
          if (fileUrls?.length) attachments.push(...fileUrls);
        } else {
          const imageMessage = messageSection.querySelector('img')?.getAttribute('src');
          if (imageMessage) {
            attachments.push(imageMessage);
          }
        }
      }

      if (attachments.length) extend(message, { attachments });

      if (!isEmpty(message)) allMessagesDiv.push(message);
    }
    console.log('🚀 ~ :122 ~ allMessagesDiv:', allMessagesDiv.length, allMessagesDiv, editedMessage);
    if (allMessagesDiv?.length) {
      await setLocal(`sender-messages-${senderRoomId}`, allMessagesDiv);

      const lastMessage = allMessagesSections[allMessagesSections.length - 1].querySelector('button[id="setFavoriteStory"]');

      const ariaLabel = lastMessage?.getAttribute('aria-label');
      if (ariaLabel?.toLowerCase()?.includes('remove')) {
        // continue;
      } else {
        lastMessage.click();
      }
    }

    if (editedMessage) {
      await setLocal(`edited-messages-${senderRoomId}`, editedMessage);
    }

    const upworkCustomers = document.querySelectorAll('a[data-test="room-list-item"]');
    const newMessage = upworkCustomers[0].querySelector('div[class*="item-indicators"]');
    if (newMessage && i === 0) upworkCustomers[1].click();
    if (newMessage) break;

    await sleep(randomDelay || 1);
  }
};

const uploadFile = async (fileInput, file) => {
  const dataTransfer = new DataTransfer(); // Create a new DataTransfer object
  dataTransfer.items.add(file); // Add the file to the dataTransfer object
  fileInput.files = dataTransfer.files; // Assign the files to the input element

  // Trigger change event to simulate the user selecting the file
  const event = new Event('change', { bubbles: true });
  await fileInput.dispatchEvent(event);
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

        const senderMessage = senderMessages[i];
        const {
          message = '',
          attachments = []
        } = senderMessage || {};
        console.log('\n message', message);

        let input = desktopRoom.querySelector('div.input-area').querySelector('p');
        if (input) {
          input.innerText = message;
        } else {
          await sleep(3);
          input = desktopRoom.querySelector('div.input-area').querySelector('p');
          if (input) {
            input.innerText = message;
          }
        }

        for (let i = 0; i < attachments.length; i += 1) {
          const attachment = attachments[i];
          const response = await fetch(attachment);
          const blob = await response.blob();
          const url = response.url;
          const urlObj = new URL(url);
          const params = new URLSearchParams(urlObj.search);

          const contentDisposition = params.get('response-content-disposition');

          let fileName = null;
          if (contentDisposition) {
            const match = contentDisposition.match(/filename\*?=(?:utf-8'')?([^;&]+)/i);
            if (match && match[1]) {
              fileName = decodeURIComponent(match[1].replace(/"/g, ''));
            }
          }

          console.log('fileName', fileName);
          const file = new File([blob], fileName, { type: 'application/octet-stream' });
          const fileInput = desktopRoom.querySelector('input[id="file-upload"]');

          await uploadFile(fileInput, file);
          await sleep(3);

          while (true) {
            const uploading = desktopRoom.querySelector('div[class*="uploading"]');
            if (!uploading) break;
            await sleep(2);
          }

          continue;
        }

        await sleep(2);

        let disabled;
        while (true) {
          const sendButton = desktopRoom.querySelector('button[data-cy="send-message"]');
          disabled = sendButton.getAttribute('disabled');

          await sleep(2);
          if (!disabled) break;
        }

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

    const newSenderMessages = await getLocal(`sender-messages-${senderRoomId}`);
    const isSame = isEqual(senderMessages, newSenderMessages);
    if (isSame) {
      await setLocal(`sender-messages-${senderRoomId}`, []);
    }
  } catch (error) {
    console.log('🚀 ~ :279 ~ SendSenderMessagesToReciever ~ error:', error);
    alert(`${error.message} at line # 279`);
  }
};

const UpworkSender = async (scrollTheChat) => {
  try {
    console.log('\n Upwork Sender Script is going to run');
    await waitForSelector(document, 'a[data-test="room-list-item"]');
    const upworkCustomers = document.querySelectorAll('a[data-test="room-list-item"]:not([articlecovered])');

    for (let i = 0; i < upworkCustomers.length; i += 1) {
      upworkCustomers[i]?.setAttribute('articleCovered', true);

      const contentDiv = upworkCustomers[i].querySelector('div[class*="right-content"]');
      const newDiv = document.createElement('div');
      newDiv.id = 'main-product-info-div';

      const root = createRoot(newDiv);
      const roomId = upworkCustomers[i].getAttribute('id');
      const roomName = upworkCustomers[i].querySelectorAll('.item-title');

      console.log('roomId', roomId);
      root.render(<Connect senderRoomId={roomId} senderRoomName={roomName} />);

      console.log('\n contentDiv', contentDiv);
      if (contentDiv) contentDiv.appendChild(newDiv);
    }

    const roomPanelList = document.querySelector('div[class*="rooms-panel-room-list"]');
    if (roomPanelList) {
      roomPanelList.style.display = 'flex';
      roomPanelList.style.flexDirection = 'column';
      roomPanelList.style.gap = '50px';
    }

    await SaveSenderMessagesInStorage(scrollTheChat);
  } catch (error) {
    console.log('🚀 ~ :317 ~ UpworkSender ~ error:', error);
    alert(`${error.message} at line # 316`);
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
      const roomName = upworkRecievers[i].querySelector('div.header-row').querySelector('span[data-test="room-name"]')?.innerText;

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
    console.log('🚀 ~ :358 ~ UpworkReciever ~ error:', error);
    alert(`${error.message} at line # 358`);
  }
};

const updateTabIcon = (url) => {
  const link = document.querySelector('link[rel~=\'icon\']') || document.createElement('link');
  link.rel = 'icon';
  link.href = url;
  document.head.appendChild(link);
};

const getRandomInRange = (start, end) => {
  if (start > end) [start, end] = [end, start]; // Swap if start is greater than end
  return Math.floor(Math.random() * (end - start + 1)) + start;
};

const SenderScript = async () => {
  try {
    // change tab icon
    updateTabIcon('https://i.pinimg.com/736x/e2/29/50/e22950b0a26db427c651dccba60ab62c.jpg');
    let scrollTheChat = true;
    while (true) {
      const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
      const extensionEnabled = await getLocal('extension-enabled');
      const delayAfterTotalRoomsStart = await getLocal('delay-after-total-rooms-start');
      const delayAfterTotalRoomsEnd = await getLocal('delay-after-total-rooms-end');
      console.log('\n delayAfterTotalRoomsStart', delayAfterTotalRoomsStart);
      console.log('\n delayAfterTotalRoomsEnd', delayAfterTotalRoomsEnd);
      const randomDelay = getRandomInRange(delayAfterTotalRoomsStart, delayAfterTotalRoomsEnd);

      if (extensionEnabled) {
        const currentUrl = document.location.href;
        if (currentUrl.includes(senderCompanyReferenceId)) {
          await UpworkSender(scrollTheChat);
          await sleep(randomDelay || 1);
          scrollTheChat = false;
        }
      } else {
        console.log('\n Upwork Message Extension is not enabled');
        updateTabIcon('https://www.citypng.com/public/uploads/preview/red-dot-circle-icon-transparent-background-701751694972430m9tnpqnwnd.png');
        return;
      }
    }
  } catch (error) {
    console.log('🚀 ~ :403 ~ SenderScript ~ error:', error);
    alert(`${error.message} at line # 402`);
  }
};

const RecieverScript = async () => {
  try {
    updateTabIcon('https://i.pinimg.com/736x/e2/29/50/e22950b0a26db427c651dccba60ab62c.jpg');
    while (true) {
      const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');
      const extensionEnabled = await getLocal('extension-enabled');

      if (extensionEnabled) {
        const currentUrl = document.location.href;
        if (currentUrl.includes(recieverCompanyReferenceId)) {
          await UpworkReciever();
          await sleep(2);
        }
      } else {
        console.log('\n Upwork Message Extension is not enabled');
        updateTabIcon('https://www.citypng.com/public/uploads/preview/red-dot-circle-icon-transparent-background-701751694972430m9tnpqnwnd.png');
        return;
      }
    }
  } catch (error) {
    console.log('🚀 ~ :428 ~ RecieverScript ~ error:', error);
    alert(`${error.message} at line # 426`);
  }
};

export {
  updateTitle,
  SenderScript,
  RecieverScript,
  UpworkSender,
  UpworkReciever
};
