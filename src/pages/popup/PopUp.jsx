import React, { useEffect, useState } from 'react';
import { Switch, Input, Space, Button, Typography, notification } from 'antd';

import { getLocal, setLocal } from '../../services/dbService';

const { Title } = Typography;

const PopupComponent = () => {
  const [settingsObj, setSettingsObj] = useState({
    checked: false,
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
      checked: extensionEnabled || false,
      senderReference: senderCompanyReferenceId || '',
      recieverReference: recieverCompanyReferenceId || ''
    });
  };

  const handleSettingsChromeLocal = async (key, value) => {
    setSettingsObj({
      ...settingsObj,
      [key]: value
    });

    if (key === 'senderReference' && !value) {
      openNotification('Sender Company Reference ID', 'Sender Company Reference ID can not be empty');
      return;
    }
    if (key === 'recieverReference' && !value) {
      openNotification('Reciever Company Reference ID', 'Reciever Company Reference ID can not be empty');
      return;
    }

    if (key === 'checked') await setLocal('extension-enabled', value);
    if (key === 'senderReference') await setLocal('sender-company-reference-id', value);
    if (key === 'recieverReference') await setLocal('reciever-company-reference-id', value);
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
        <Switch
          checkedChildren='Enabled'
          unCheckedChildren='Disabled'
          checked={settingsObj.checked}
          onChange={(e) => handleSettingsChromeLocal('checked', e)}
        />
        
        <Input 
          placeholder='Enter sender company reference' 
          value={settingsObj.senderReference}
          onChange={(e) => handleSettingsChromeLocal('senderReference', e.target.value)}
        />
        
        <Input 
          placeholder='Enter receiver company reference' 
          value={settingsObj.recieverReference}
          onChange={(e) => handleSettingsChromeLocal('recieverReference', e.target.value)}
        />
        
        {/* <Button
          type='primary'
          onClick={handleSettingsChromeLocal}
          style={{ width: '100%' }}
        >
          Save
        </Button> */}
      </Space>
    </div>
  );
};

export default PopupComponent;
