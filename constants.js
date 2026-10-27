const { generateGuid } = require("./src/services/utils");
const constants = {
  appConfig: {
    appName: "Upwork Message Extension",
    urls: {
      chrome: "CHROME_STORE_URL",
    },
    key: "SSH_PUBLIC_KEY",
  },
  contentScript: {
    mountId: generateGuid(),
  },
  hashSecret: 'itsmysecret'
};

module.exports = constants;
