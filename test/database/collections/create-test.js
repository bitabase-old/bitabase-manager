const test = require('tape');
const righto = require('righto');
const httpRequest = require('../../helpers/httpRequest');
const createMockRqliteServer = require('../../helpers/createMockRqliteServer');
const createServer = require('../../helpers/createServer');
const { createUserAndSession } = require('../../helpers/session');

const createDatabase = (headers, data) =>
  httpRequest('/v1/databases', {
    method: 'post',
    headers,
    data: data || {
      name: 'testing'
    }
  });

test('database collections: create a new collection -> no session', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const response = await httpRequest('/v1/databases/unknown/collections', {
    method: 'post',
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    errors: ['invalid session provided']
  });

  await server.stop();
  await mockRqlite.stop();
});

test('database collections: create a new collection -> no database', async t => {
  t.plan(1);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();

  const response = await httpRequest('/v1/databases/unknown/collections', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 404);

  await server.stop();
  await mockRqlite.stop();
});

test('database collections: create a new collection -> no post body', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();

  const response = await httpRequest('/v1/databases/unknown/collections', {
    method: 'post',
    headers: session.asHeaders
  });

  t.equal(response.status, 422);
  t.equal(response.data.errors.body, 'no post body was provided');

  await server.stop();
  await mockRqlite.stop();
});

test('database collections: create a new collection', async t => {
  t.plan(3);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  const response = await httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  t.equal(response.status, 201);

  t.ok(response.data.id);
  t.equal(response.data.name, 'testingcollection');

  await server.stop();
  await mockRqlite.stop();
});

test('database collections: create a new collection -> duplicate', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  await httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  const secondCollection = await httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  t.equal(secondCollection.status, 422);
  t.equal(secondCollection.data.errors.name, 'collection name already exists');

  await server.stop();
  await mockRqlite.stop();
});
