if (process.env.NODE_ENV === 'development') {
  require('trace');
  require('clarify');
}

const http = require('http');
const path = require('path');

const righto = require('righto');
const findMyWay = require('find-my-way');
const up = require('node-mini-migrations/up');
const getMigrationsFromDirectory = require('node-mini-migrations/getMigrationsFromDirectory');
const rqlite = require('rqlite-fp');

const defaultConfig = require('./config');
const migrator = require('./migrations');

const setCrossDomainOriginHeaders = require('./modules/setCrossDomainOriginHeaders');

let server;
function createServerWithServices (db, config, callback) {
  const [host, port] = config.bind.split(':');

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
  }).listen(port, host);

  console.log(`[bitabase-manager] Listening on ${host}:${port}`);

  return server;
}

function createServer (configOverrides, callback) {
  const config = {
    ...defaultConfig,
    ...configOverrides
  };

  const db = righto(rqlite.connect, config.dataServer);
  const driver = righto.sync(migrator, db);
  const migrations = getMigrationsFromDirectory(path.resolve(__dirname, './migrations'));
  const migrated = righto(up, driver, migrations);

  const server = righto(createServerWithServices, db, config, righto.after(migrated));

  server(callback);
}

module.exports = createServer;
