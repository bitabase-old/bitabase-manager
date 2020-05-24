const rqlite = require('rqlite-fp');

module.exports = function (db) {
  return {
    init: (direction, callback) => {
      rqlite.run(db, 'CREATE TABLE IF NOT EXISTS _migrations (file TEXT PRIMARY KEY);', callback);
    },

    getMigrationState: (id, callback) => {
      rqlite.getOne(db, 'SELECT file FROM _migrations WHERE file = ?', [id], callback);
    },

    setMigrationUp: (id, callback) => {
      rqlite.run(db, 'INSERT INTO _migrations (file) VALUES (?)', [id], callback);
    },

    setMigrationDown: (id, callback) => {
      rqlite.run(db, 'DELETE FROM _migrations WHERE file = ?', [id], callback);
    },

    handler: (fn, callback) => fn(db, callback)
  };
};
