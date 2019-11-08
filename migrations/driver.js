const sqlite = require('sqlite')

module.exports = function () {
  let db

  return {
    init: async () => {
      db = await sqlite.open('./data/manager.sqlite')
      await db.run('CREATE TABLE IF NOT EXISTS _migrations (file TEXT PRIMARY KEY);')
    },

    finish: async () => {
      await db.close()
    },

    getMigrationState: async (id) => {
      return db.get('SELECT file FROM _migrations WHERE file = ?', [id])
    },

    setMigrationUp: async (id) => {
      return db.run('INSERT INTO _migrations (file) VALUES (?)', [id])
    },

    setMigrationDown: async (id) => {
      return db.run('DELETE FROM _migrations WHERE file = ?', [id])
    },

    getPassedFunctions: async () => {
      return db
    }
  }
}
