import { useEffect, useState } from 'react';
import { Button, Modal, Select } from 'antd';

import { getLocal, setLocal } from '../../services/dbService';

const Connect = ({ senderRoomId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recieverRoomId, setRecieverRoomId] = useState('');
  const [localRecieverRoomIds, setLocalRecieverRoomIds] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [alreadyMapped, setAlreadyMapped] = useState(false);

  const fetchRecieverData = async () => {
    const senderRecieverMappingId = await getLocal(senderRoomId);
    const recieverRoomIds = await getLocal('reciever-room-ids');
    if (senderRecieverMappingId) {
      const recieverRoomName = recieverRoomIds.find(obj => obj.value === senderRecieverMappingId);
      setSelectedValue(recieverRoomName.label);

      const notMapped = recieverRoomIds.filter((obj) => obj.value !== senderRecieverMappingId);
      setLocalRecieverRoomIds(notMapped);
    } else {
      setLocalRecieverRoomIds(recieverRoomIds);
    }
  };

  const handleClick = async (e, senderRoomId) => {
    const senderRecievingMapId = await getLocal(senderRoomId);

    if (!senderRecievingMapId) {
      setIsModalOpen(!isModalOpen);
      fetchRecieverData();
  
      e.stopPropagation();
      e.preventDefault();
    } else {
      const senderRecievingMapId = await getLocal(senderRoomId);

      setSelectedValue('');
      setAlreadyMapped(false);

      await setLocal(senderRoomId, null);
      await setLocal(senderRecievingMapId, null);
      await setLocal(`sender-messages-${senderRoomId}`, []);
    }
  };

  const handleOk = async () => {
    await setLocal(senderRoomId, recieverRoomId);
    await setLocal(recieverRoomId, senderRoomId);

    setAlreadyMapped(true);
    setIsModalOpen(!isModalOpen);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleChange = (value) => {
    console.log('\n reciever room id', value);
    setRecieverRoomId(value);
    setSelectedValue(value);
  };

  const initalUseEffectData = async () => {
    const senderAlreadyMapped = await getLocal(senderRoomId);
    if (senderAlreadyMapped) setAlreadyMapped(true);
  };

  useEffect(() => {
    initalUseEffectData();
  }, []);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '6px'
        }}
      >
        <Button
          style={{
            backgroundColor: alreadyMapped ? 'red' : 'white'
          }}
          onClick={(e) => handleClick(e, senderRoomId)}
        >
          {alreadyMapped ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
      <Modal
        title='Select an Option'
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText='Submit'
        cancelText='Cancel'
      >
        <div className='mb-4'>
          <Select
            placeholder='Please select an option'
            style={{ width: '100%' }}
            onChange={handleChange}
            options={localRecieverRoomIds}
            value={selectedValue}
          />
        </div>
      </Modal>
    </>
  );
};

export default Connect;
