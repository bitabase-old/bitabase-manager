if (process.env.NODE_ENV === 'development') {
  require('async-bugs');
}

const http = require('http');
const path = require('path');

const righto = require('righto');
const findMyWay = require('find-my-way');
const up = require('node-mini-migrations/up');
const getMigrationsFromDirectory = require('node-mini-migrations/getMigrationsFromDirectory');
const rqlite = require('rqlite-fp');

const migrator = require('./migrations');

const setCrossDomainOriginHeaders = require('./modules/setCrossDomainOriginHeaders');
const setupServerSyncer = require('./modules/setupServerSyncer');

let server;
function createServerWithServices (db, config, callback) {
  const router = findMyWay({
    defaultRoute: (request, response) => {
      setCrossDomainOriginHeaders(config, request, response);
      response.writeHead(404);
      response.end('Not Found');
    }
  });
  router.on('OPTIONS', '*', function (request, response) {
    setCrossDomainOriginHeaders(config, request, response);
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
  }).listen(config.bindPort, config.bindHost);

  server.on('listening', function () {
    const address = server.address();
    console.log(`[bitabase-manager] Listening on ${config.bindHost} (${address.address}:${address.port})`);

    callback(null, server);
  });
}

function createServer (config = {}, callback) {
  config.bindHost = config.bindHost || '0.0.0.0';
  config.advertiseHost = config.advertiseHost || config.bindHost;
  config.bindPort = config.bindPort || 8001;
  config.allowedCrossOriginDomains = config.setCrossDomainOriginHeaders || [];
  config.passwordHash = config.passwordHash || {
    iterations: config.passwordHashIterations || 372791
  };

  if (!config.secret) {
    throw new Error('Config option secret is required but was not provided');
  }

  const serverSyncerPromise = config.servers || setupServerSyncer(config, 'manager');

  const db = righto(rqlite.connect, config.rqliteAddr, {
    retries: 10,
    retryDelay: 5000,
    onRetry: () => console.log('Could not connect to: ' + config.rqliteAddr + '. Trying again...')
  });
  const driver = righto.sync(migrator, db);
  const migrations = getMigrationsFromDirectory(path.resolve(__dirname, './migrations'));
  const migrated = righto(up, driver, migrations);

  const createdServer = righto(createServerWithServices, db, config, righto.after(migrated));

  createdServer(function (error, server) {
    if (error) {
      return callback(error);
    }

    callback && callback(null, {
      server,
      stop: async () => {
        const serverSyncer = await serverSyncerPromise;
        serverSyncer && serverSyncer.stop && serverSyncer.stop();
        server.close();
      }
    });
  });
}

module.exports = createServer;
