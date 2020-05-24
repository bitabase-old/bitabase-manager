const http = require('http');
const { promisify } = require('util');

const righto = require('righto');
const findMyWay = require('find-my-way');
const up = require('node-mini-migrations/up');
const getMigrationsFromDirectory = require('node-mini-migrations/getMigrationsFromDirectory');
const rqlite = require('rqlite-fp');

const config = require('./config');
const migrator = require('./migrations');

const setCrossDomainOriginHeaders = require('./modules/setCrossDomainOriginHeaders');

function migrateUp (callback) {
  const db = righto(rqlite.connect, config.dataServer);
  const driver = righto.sync(migrator, db);
  const migrations = getMigrationsFromDirectory('./migrations');
  const migrated = righto(up, driver, migrations);
  migrated(callback);
}

let server;
async function start () {
  await promisify(migrateUp)();

  const router = findMyWay({
    defaultRoute: (request, response) => {
      setCrossDomainOriginHeaders(request, response);
      response.writeHead(404);
      response.end('Not Found');
    }
  });
  router.on('OPTIONS', '*', function (request, response) {
    setCrossDomainOriginHeaders(request, response);
    response.end();
  });

  const db = await promisify(rqlite.connect)(config.dataServer);

  const services = { config, db };

  router.on('POST', '/v1/users', require('./commands/user/create.js')(services));
  router.on('POST', '/v1/sessions', require('./commands/session/create.js')(services));
  router.on('GET', '/v1/sessions/current', require('./commands/session/readCurrent.js')(services));
  router.on('GET', '/v1/databases', require('./commands/database/list.js')(services));
  router.on('POST', '/v1/databases', require('./commands/database/create.js')(services));
  router.on('POST', '/v1/databases/:databaseName/collections', require('./commands/database/collections/create.js')(services));
  router.on('PUT', '/v1/databases/:databaseName/collections/:collectionName', require('./commands/database/collections/update.js')(services));
  router.on('GET', '/v1/databases/:databaseName/collections', require('./commands/database/collections/list.js')(services));
  router.on('GET', '/v1/databases/:databaseName/collections/:collectionName', require('./commands/database/collections/read.js')(services));
  router.on('GET', '/v1/databases/:databaseName/collections/:collectionName/logs', require('./commands/database/collections/logs/list.js')(services));
  router.on('POST', '/v1/usage-batch', require('./commands/usageBatch.js')(services));

  server = http.createServer((req, res) => {
    router.lookup(req, res);
  }).listen(config.port);

  console.log(`[bitabase-manager] Listening on port ${config.port}`);
}

function stop () {
  console.log('[bitabase-manager] Shutting down');
  server && server.close();
}

module.exports = {
  migrateUp,
  start,
  stop
};
