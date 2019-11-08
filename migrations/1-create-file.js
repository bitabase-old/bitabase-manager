module.exports = {
  up: db => {
    return Promise.all([
      db.exec('CREATE TABLE users          (id TEXT PRIMARY KEY, email TEXT, password TEXT, date_created INTEGER)'),
      db.exec('CREATE TABLE sessions       (id TEXT PRIMARY KEY, secret TEXT, user_id TEXT, date_created INTEGER)'),
      db.exec('CREATE TABLE databases      (id TEXT PRIMARY KEY, name TEXT, schema TEXT, date_created INTEGER)'),
      db.exec('CREATE TABLE database_users (id TEXT PRIMARY KEY, user_id TEXT, database_id TEXT, role TEXT, date_created INTEGER)')
    ])
  },

  down: db => {
    return Promise.all([
      db.exec('DROP TABLE databases_users'),
      db.exec('DROP TABLE databases'),
      db.exec('DROP TABLE sessions'),
      db.exec('DROP TABLE users')
    ])
  }
}
