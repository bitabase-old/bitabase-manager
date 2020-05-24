const rqlite = require('rqlite-fp');

module.exports = {
  up: (db, callback) => {
    rqlite.execute(db, `
      CREATE TABLE collections (
        id TEXT PRIMARY KEY,
        database_id TEXT,
        name TEXT,
        schema TEXT,
        total_reads INTEGER DEFAULT 0,
        total_writes INTEGER DEFAULT 0,
        total_space INTEGER DEFAULT 0,
        date_created INTEGER
      )
    `, callback);
  },

  down: (db, callback) => {
    rqlite.execute(db, 'DROP TABLE collections', callback);
  }
};
