const rqlite = require('rqlite-fp');
const righto = require('righto');

module.exports = {
  up: (db, callback) => {
    righto.all([
      righto(rqlite.execute, db, 'CREATE TABLE users          (id TEXT PRIMARY KEY, email TEXT, password TEXT, date_created INTEGER)'),
      righto(rqlite.execute, db, 'CREATE TABLE sessions       (id TEXT PRIMARY KEY, secret TEXT, user_id TEXT, date_created INTEGER)'),
      righto(rqlite.execute, db, `
        CREATE TABLE databases (
          id TEXT PRIMARY KEY,
          name TEXT,
          total_reads INTEGER DEFAULT 0,
          total_writes INTEGER DEFAULT 0,
          total_space INTEGER DEFAULT 0,
          date_created INTEGER
        )
      `),
      righto(rqlite.execute, db, 'CREATE TABLE database_users (id TEXT PRIMARY KEY, user_id TEXT, database_id TEXT, role TEXT, date_created INTEGER)')
    ])(callback);
  },

  down: (db, callback) => {
    righto.all([
      righto(rqlite.execute, db, 'DROP TABLE database_users'),
      righto(rqlite.execute, db, 'DROP TABLE databases'),
      righto(rqlite.execute, db, 'DROP TABLE sessions'),
      righto(rqlite.execute, db, 'DROP TABLE users')
    ])(callback);
  }
};
