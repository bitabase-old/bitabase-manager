const path = require('path')
const ensureDirectoryExists = require('./ensureDirectoryExists')
const { promisify } = require('util')

const sqlite3 = require('sqlite3').verbose()

function createDatabase (filename, resolve) {
  const db = new sqlite3.Database(filename, function () {
    resolve({
      db,

      prepare: (sql) => {
        const stmt = db.prepare(sql)
        return {
          run: stmt.run.bind(stmt),
          finalize: promisify(stmt.finalize.bind(stmt))
        }
      },
      each: promisify(db.each.bind(db)),
      all: promisify(db.all.bind(db)),
      close: promisify(db.close.bind(db)),
      run: promisify(db.run.bind(db)),
      runIgnore: function (sql) {
        return new Promise((resolve, reject) => {
          db.run(sql, function (error, result) {
            if (error) {
              if (!error.toString().includes('already exists')) {
                return reject(error)
              }
            }
            resolve(result)
          })
        })
      }
    })
  })
}

function connect (filename) {
  return new Promise((resolve) => {
    if (filename.includes('..')) {
      throw new Error('db can not contain ..')
    }

    filename = path.resolve(__dirname, '../data', filename)
    ensureDirectoryExists(filename, { resolve: true })
      .then(() => createDatabase(filename, resolve))
  })
}

module.exports = connect
