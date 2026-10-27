const baseConfig = require("./webpack.config");
module.exports = (env, options) => {
  return baseConfig(env, {
    ...options,
    browser: "chromium",
  });
};
