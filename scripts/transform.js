const constants = require("../constants");
const pkg = require("../package.json");
const manifestTransform = (content, path, options) => {
  const { mode, browser } = options;
  const modify = (buffer) => {
    const manifest = JSON.parse(buffer.toString());
    if (mode === "development") {
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
