module.exports = {
  up: db => {
    return Promise.all([
      db.exec('CREATE TABLE users          (id INTEGER PRIMARY KEY, email TEXT, password TEXT)').catch(console.log),
      db.exec('CREATE TABLE sessions       (id TEXT PRIMARY KEY, secret TEXT, user_id INTEGER)'),
      db.exec('CREATE TABLE databases      (id INTEGER PRIMARY KEY, name TEXT, schema TEXT)'),
      db.exec('CREATE TABLE database_users (id INTEGER PRIMARY KEY, user_id INTEGER, database_id INTEGER, role TEXT)'),
    ])
  },

  down: db => {
    return Promise.all([
      db.exec('DROP TABLE databases_users'),
      db.exec('DROP TABLE databases'),
      db.exec('DROP TABLE sessions'),
      db.exec('DROP TABLE users'),
    ])
  }
}
