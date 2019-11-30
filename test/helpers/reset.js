const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const config = require('../../config');
const originalConfig = JSON.parse(JSON.stringify(config));

module.exports = function () {
  return new Promise((resolve, reject) => {
    const dataFolder = path.resolve(config.dataPath);

    Object.assign(config, originalConfig);

    fs.rmdir(dataFolder, { recursive: true }, err => {
      if (err) {
        return reject(err);
      }
      mkdirp(dataFolder, resolve);
    });
  });
};
