const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rqlite = require('rqlite-fp');

const config = require('../../config');
const originalConfig = JSON.parse(JSON.stringify(config));

const test = require('tape');

let stopRqlite;

test.onFinish(function () {
  stopRqlite && stopRqlite();
});

module.exports = async function () {
  await new Promise((resolve, reject) => {
    // if (!stopRqlite) {
    //   return rqlite.start({}, function (error, stop) {
    //     if (error) {
    //       return reject(error)
    //     }
    //     stopRqlite = stop
    //     resolve()
    //   })
    // }
    resolve();
  });

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
