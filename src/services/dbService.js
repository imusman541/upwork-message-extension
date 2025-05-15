const set = (params) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set(params, () => {
        resolve(params);
      });
    } catch (e) {
      reject(e);
    }
  });
};

const get = (params) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(params, (items) => {
        if (items === undefined) {
          reject(new Error('Error'));
        } else {
          resolve({ ...items });
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

const remove = (keyStr) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.remove(keyStr, () => {
        resolve(keyStr);
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAll = () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(null, (items) => {
        if (items === undefined) {
          reject(new Error('Error'));
        } else {
          resolve(items);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

const onChange = (keyToCheck, callback) => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (keyToCheck == key) {
        callback(oldValue, newValue);
      }
    }
  });
};

const onAnyDBChange = (callback) => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    const newObject = {};
    for (const [key, { newValue }] of Object.entries(changes)) {
      newObject[key] = newValue;
    }
    callback(newObject);
  });
};

const getLocal = async (localName) => {
  const localStorage = await chrome.storage.local.get(localName);
  return localStorage[localName];
};

const setLocal = async (localName, jsonData) => {
  return await chrome.storage.local.set({ [localName]: jsonData });
};

export {
  set,
  get,
  getLocal,
  setLocal,
  getAll,
  remove,
  onChange,
  onAnyDBChange 
};
