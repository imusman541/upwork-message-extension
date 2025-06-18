import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Space,
  Typography,
  notification
} from 'antd';

import { getLocal, setLocal } from '../../services/dbService';

const { Title } = Typography;

const PopupComponent = () => {
  const [settingsObj, setSettingsObj] = useState({
    startTheScript: false,
    senderReference: '',
    recieverReference: '',
    numberOfRoomsToCheck: 3,
    delayAfterTotalRooms: 1,
    delayPerRoom: 1
  });
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (header, description) => {
    api.open({
      message: header,
      description,
      duration: 0
    });
  };

  const fetchPopupSettingsData = async () => {
    const extensionEnabled = await getLocal('extension-enabled');
    const senderCompanyReferenceId = await getLocal('sender-company-reference-id');
    const recieverCompanyReferenceId = await getLocal('reciever-company-reference-id');
    const numberOfRoomsToCheckLocal = await getLocal('number-of-rooms-to-check');
    const delayAfterTotalRoomsLocal = await getLocal('delay-after-total-rooms');
    const delayPerRoomLocal = await getLocal('delay-per-room');

    setSettingsObj({
      startTheScript: extensionEnabled || false,
      senderReference: senderCompanyReferenceId || '',
      recieverReference: recieverCompanyReferenceId || '',
      numberOfRoomsToCheck: numberOfRoomsToCheckLocal || 3,
      delayAfterTotalRooms: delayAfterTotalRoomsLocal || 1,
      delayPerRoom: delayPerRoomLocal || 1
    });
  };

  const handleSettingsChromeLocal = async (key, value) => {
    if (key === 'startTheScript') {
      if (!settingsObj.senderReference || !settingsObj.recieverReference) {
        openNotification('Error', 'Sender/Receiver Company Reference ID can not be empty');
        return;
      }
      await setLocal('extension-enabled', value);

      if (value) {
        await chrome.runtime.sendMessage({
          payload: {},
          callback: 'start-the-script'
        });
      }
    }

    if (key === 'senderReference') await setLocal('sender-company-reference-id', value);
    if (key === 'recieverReference') await setLocal('reciever-company-reference-id', value);
    if (key === 'numberOfRoomsToCheck') await setLocal('number-of-rooms-to-check', value);
    if (key === 'delayAfterTotalRooms') await setLocal('delay-after-total-rooms', value);
    if (key === 'delayPerRoom') await setLocal('delay-per-room', value);

    setSettingsObj({
      ...settingsObj,
      [key]: value
    });
  };

  useEffect(() => {
    fetchPopupSettingsData();
  }, []);

  return (
    <div
      style={{
        padding: '16px',
        width: '300px'
      }}
    >
      {contextHolder}
      <Title
        level={4}
        style={{
          marginTop: 0,
          marginBottom: '16px'
        }}
      >
        Settings
      </Title>

      <Space
        direction='vertical'
        size='middle'
        style={{ width: '100%' }}
      >
        <Button
          type='primary'
          onClick={() => handleSettingsChromeLocal('startTheScript', settingsObj.startTheScript ? false : true)}
          style={{ backgroundColor: settingsObj.startTheScript ? 'red' : 'green' }}
        >
          {settingsObj.startTheScript ? 'Stop' : 'Start'}
        </Button>
        <div>
          <p style={{ fontWeight: 'bold' }}>Sender Company Reference ID:</p>
          <Input
            placeholder='Enter sender company reference'
            value={settingsObj.senderReference}
            disabled={settingsObj.startTheScript}
            onChange={(e) => handleSettingsChromeLocal('senderReference', e.target.value)}
          />
        </div>

        <div>
          <p style={{ fontWeight: 'bold' }}>Receiver Company Reference ID:</p>
          <Input
            placeholder='Enter receiver company reference'
            value={settingsObj.recieverReference}
            disabled={settingsObj.startTheScript}
            onChange={(e) => handleSettingsChromeLocal('recieverReference', e.target.value)}
          />
        </div>

        <div>
          <p style={{ fontWeight: 'bold' }}>Total Rooms:</p>
          <InputNumber
            min={1}
            onChange={(e) => handleSettingsChromeLocal('numberOfRoomsToCheck', e)}
            value={settingsObj.numberOfRoomsToCheck}
          />
        </div>

        <div>
          <p style={{ fontWeight: 'bold' }}>Delay after Total Rooms:</p>
          <InputNumber
            min={1}
            onChange={(e) => handleSettingsChromeLocal('delayAfterTotalRooms', e)}
            value={settingsObj.delayAfterTotalRooms}
          />
        </div>

        <div>
          <p style={{ fontWeight: 'bold' }}>Delay per room:</p>
          <InputNumber
            min={1}
            onChange={(e) => handleSettingsChromeLocal('delayPerRoom', e)}
            value={settingsObj.delayPerRoom}
          />
        </div>
      </Space>
    </div>
  );
};

export default PopupComponent;
