const test = require('tape');
const httpRequest = require('../../../helpers/httpRequest');

const reset = require('../../../helpers/reset');
const { createUserAndSession } = require('../../../helpers/session');
const server = require('../../../../server');
const config = require('../../../../config');
const createHttpServer = require('../../../helpers/createHttpServer');

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

function createMockServer (i = 8000) {
  return createHttpServer(async function (request, response) {
    response.writeHead(200);
    response.end(JSON.stringify([{
      a: 1
    }]));
  }, i);
}

test('database collections: list logs', async t => {
  t.plan(1);
  await reset();

  const mockServer = createMockServer();
  await mockServer.start();

  await server.start();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);
  await createCollection(session.asHeaders);

  const response = await httpRequest('/v1/databases/testing/collections/testing/logs', {
    method: 'get',
    headers: session.asHeaders
  });

  await mockServer.stop();
  await server.stop();

  t.equal(response.data[0].a, 1);
});

test('database collections: list logs multiple servers', async t => {
  t.plan(2);
  await reset();

  config.servers = [
    'http://localhost:8001',
    'http://localhost:8002'
  ];
  const mockServer1 = createMockServer(8001);
  const mockServer2 = createMockServer(8002);
  await mockServer1.start();
  await mockServer2.start();
  await server.start();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);
  await createCollection(session.asHeaders);

  const response = await httpRequest('/v1/databases/testing/collections/testing/logs', {
    method: 'get',
    headers: session.asHeaders
  });

  await mockServer1.stop();
  await mockServer2.stop();
  await server.stop();

  t.equal(response.data[0].a, 1);
  t.equal(response.data[1].a, 1);
});
