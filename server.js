const http = require('http')
const findMyWay = require('find-my-way')
const migrations = require('node-mini-migrations')
const sqlite = require('sqlite')

const config = require('./config/config')

function migrateUp () {
  return migrations.up(
    migrations. prepareRun('./migrations')
  )
}

let server
async function start () {
  await migrateUp()

  const db = await sqlite.open('./data/manager.sqlite')

  const router = findMyWay()
  router.on('POST', '/api/users', require('./commands/user/create.js')({db}))
  router.on('POST', '/api/databases', require('./commands/database/create.js')({db}))

  server = http.createServer((req, res) => {
    if (req.headers.host === config.homeDomain) {
      if (!req.url.startsWith('/api/')) {
        require('./commands/home/index.js')(req, res)
      } else {
        router.lookup(req, res)
      }
    } else {
      subRouter.lookup(req, res)
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
