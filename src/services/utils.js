const print = (text) => {
  console.log('🚀 ~ ', text);
};

const generateGuid = () => {
  var result, i, j;
  result = '';
  for (j = 0; j < 32; j++) {
    if (j == 8 || j == 12 || j == 16 || j == 20) result = result + '-';
    i = Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();
    result = result + i;
  }
  return result;
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms * 1000));

module.exports = {
  print,
  generateGuid,
  sleep
};
