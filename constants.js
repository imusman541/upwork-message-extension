const { generateGuid } = require("./src/services/utils");
const constants = {
  appConfig: {
    appName: "Upwork Message Extension",
    urls: {
      chrome: "CHROME_STORE_URL",
    },
    // put extension key here if required which would only be used in development mode
    key: "SSH_PUBLIC_KEY", // gather it from extension store
  },
  contentScript: {
    mountId: generateGuid(),
  },
  hashSecret: 'itsmysecret'
};

module.exports = constants;
