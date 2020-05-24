const { promisify } = require('util');

const fs = require('fs');
const path = require('path');
const rqlite = require('rqlite-fp');
const righto = require('righto');

const config = require('../../config');
const originalConfig = JSON.parse(JSON.stringify(config));

const test = require('tape');

let stopRqlite;

test.onFinish(function () {
  stopRqlite && stopRqlite();
});

module.exports = async function () {
  if (stopRqlite) {
    const connection = righto(rqlite.connect, config.dataServer);
    const cleanedDatabase = righto.all([
      righto(rqlite.execute, connection, 'DELETE FROM database_users'),
      righto(rqlite.execute, connection, 'DELETE FROM databases'),
      righto(rqlite.execute, connection, 'DELETE FROM sessions'),
      righto(rqlite.execute, connection, 'DELETE FROM users'),
      righto(rqlite.execute, connection, 'DELETE FROM collections')
    ]);

    await promisify(cleanedDatabase)();
  }

  await new Promise((resolve, reject) => {
    Object.assign(config, originalConfig);

    if (!stopRqlite) {
      fs.rmdirSync('~/node', {recursive: true})

      return rqlite.start({}, function (error, stop) {
        if (error) {
          return reject(error);
        }
        stopRqlite = stop;
        resolve();
      });
    }

    resolve();
  });
};
