const constants = require("../constants");
const pkg = require("../package.json");
// options: webpack configs
const manifestTransform = (content, path, options) => {
  const { mode, browser } = options;
  const modify = (buffer) => {
    // copy-webpack-plugin passes a buffer
    const manifest = JSON.parse(buffer.toString());
    if (mode === "development") {
      // manifest.key = constants.appConfig.key;
    }
    manifest.version = pkg.version;
    manifest.action.default_title = constants.appConfig.appName;
    return JSON.stringify(manifest, null, 2);
  };
  return modify(content);
};

module.exports = {
  manifestTransform,
};
