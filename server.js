const http = require('http')
const router = require('find-my-way')()
const migrations = require('node-mini-migrations')

const config = require('./config/config')

router.on('POST', '/api/users', require('./commands/user/create.js'))
router.on('GET', '/api/collections', require('./commands/account/collections/search.js'))
router.on('POST', '/api/collections', require('./commands/account/collections/create.js'))
router.on('PUT', '/api/collections/:collectionId', require('./commands/account/collections/update.js'))

function migrateUp () {
  return migrations.up(
    migrations. prepareRun('./migrations')
  )
}

let server
async function start () {
  await migrateUp()
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
