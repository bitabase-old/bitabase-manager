module.exports = {
  up: db => {
    return Promise.all([
      db.exec(`
        CREATE TABLE collections (
          id TEXT PRIMARY KEY,
          database_id TEXT,
          name TEXT,
          schema TEXT,
          total_collections INTEGER DEFAULT 0,
          total_reads INTEGER DEFAULT 0,
          total_writes INTEGER DEFAULT 0,
          total_space INTEGER DEFAULT 0,
          date_created INTEGER
        )
      `)
    ])
  },

  down: db => {
    return Promise.all([
      db.exec('DROP TABLE collections')
    ])
  }
}
