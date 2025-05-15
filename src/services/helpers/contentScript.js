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

export {
  updateTitle
};
