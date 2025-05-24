import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
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
    recieverReference: ''
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

    setSettingsObj({
      startTheScript: extensionEnabled || false,
      senderReference: senderCompanyReferenceId || '',
      recieverReference: recieverCompanyReferenceId || ''
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
        <Input
          placeholder='Enter sender company reference'
          value={settingsObj.senderReference}
          disabled={settingsObj.startTheScript}
          onChange={(e) => handleSettingsChromeLocal('senderReference', e.target.value)}
        />

        <Input
          placeholder='Enter receiver company reference'
          value={settingsObj.recieverReference}
          disabled={settingsObj.startTheScript}
          onChange={(e) => handleSettingsChromeLocal('recieverReference', e.target.value)}
        />
      </Space>
    </div>
  );
};

export default PopupComponent;
