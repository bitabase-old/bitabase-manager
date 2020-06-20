const http = require('http');

const test = require('tape');
const righto = require('righto');

const httpRequest = require('../../../helpers/httpRequest');
const { createUserAndSession } = require('../../../helpers/session');
const createServer = require('../../../helpers/createServer');
const createMockRqliteServer = require('../../../helpers/createMockRqliteServer');

const createDatabase = (headers, data) =>
  httpRequest('/v1/databases', {
    method: 'post',
    headers,
    data: data || {
      name: 'testing'
    }
  });

const createCollection = (headers, data) =>
  httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers,
    data: {
      name: 'testing'
    }
  });

function createMockServer (i = 8100) {
  const server = http.createServer(async function (request, response) {
    response.writeHead(200);
    response.end(JSON.stringify([{
      a: 1
    }]));
  }, i);

  const promise = new Promise((resolve) => {
    server.on('listening', () => {
      resolve(server);
    });
  });

  server.listen(i);

  return promise;
}

test('database collections: list logs', async t => {
  t.plan(1);
  const mockRqlite = await righto(createMockRqliteServer);

  const mockServer = await createMockServer();

  const server = await createServer({
    servers: ['http://0.0.0.0:8100']
  });

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);
  await createCollection(session.asHeaders);

  const response = await httpRequest('/v1/databases/testing/collections/testing/logs', {
    method: 'get',
    headers: session.asHeaders
  });

  await mockRqlite.stop();
  await mockServer.close();
  await server.stop();

  t.equal(response.data[0].a, 1);
});

test('database collections: list logs multiple servers', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);

  const mockServer1 = await createMockServer(8101);
  const mockServer2 = await createMockServer(8102);
  const server = await createServer({
    servers: [
      'http://0.0.0.0:8101',
      'http://0.0.0.0:8102'
    ]
  });

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);
  await createCollection(session.asHeaders);

  const response = await httpRequest('/v1/databases/testing/collections/testing/logs', {
    method: 'get',
    headers: session.asHeaders
  });

  await mockServer1.close();
  await mockServer2.close();
  await mockRqlite.stop();
  await server.stop();

  t.equal(response.data[0].a, 1);
  t.equal(response.data[1].a, 1);
});
