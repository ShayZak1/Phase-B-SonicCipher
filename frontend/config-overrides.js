const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react': '@preact/compat',
    'react-dom/test-utils': '@preact/test-utils',
    'react-dom': '@preact/compat',
  };

  return config;
};
