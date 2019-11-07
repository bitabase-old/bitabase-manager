module.exports = {
  up: db => {
    return db.exec('CREATE TABLE test_table (test TEXT)')
  },

  down: db => {
    return db.exec('DROP TABLE test_table')
  }
}
