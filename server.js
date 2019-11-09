const http = require('http')
const findMyWay = require('find-my-way')
const migrations = require('node-mini-migrations')
const sqlite = require('sqlite')

function migrateUp () {
  return migrations.up(
    migrations.prepareRun('./migrations')
  )
}

let server
async function start () {
  await migrateUp()

  const db = await sqlite.open('./data/manager.sqlite')

  const router = findMyWay()
  router.on('POST', '/api/users', require('./commands/user/create.js')({ db }))
  router.on('POST', '/api/sessions', require('./commands/session/create.js')({ db }))
  router.on('GET', '/api/sessions/current', require('./commands/session/readCurrent.js')({ db }))
  router.on('POST', '/api/databases', require('./commands/database/create.js')({ db }))

  server = http.createServer((req, res) => {
    if (!req.url.startsWith('/api/')) {
      require('./commands/home/index.js')(req, res)
    } else {
      router.lookup(req, res)
    }
  }).listen(8000)

  console.log('Listening on port 8000')
}

function stop () {
  server.close()
}

module.exports = {
  migrateUp,
  start,
  stop
}
