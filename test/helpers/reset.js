const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const config = require('../../config');

module.exports = function () {
  return new Promise((resolve, reject) => {
    const dataFolder = path.resolve(config.dataPath);

    fs.rmdir(dataFolder, { recursive: true }, err => {
      if (err) {
        return reject(err);
      }
      mkdirp(dataFolder, resolve);
    });
  });
};
