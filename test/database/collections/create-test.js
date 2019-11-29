const test = require('tape');
const httpRequest = require('../../helpers/httpRequest');
const reset = require('../../helpers/reset');
const { createUserAndSession } = require('../../helpers/session');
const server = require('../../../server');

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
  await reset();

  await server.start();

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
});

test('database collections: create a new collection -> no database', async t => {
  t.plan(1);
  await reset();

  await server.start();

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
});

test('database collections: create a new collection -> no post body', async t => {
  t.plan(2);
  await reset();

  await server.start();

  const session = await createUserAndSession();

  const response = await httpRequest('/v1/databases/unknown/collections', {
    method: 'post',
    headers: session.asHeaders
  });

  t.equal(response.status, 422);
  t.equal(response.data.errors.body, 'no post body was provided');

  await server.stop();
});

test('database collections: create a new collection', async t => {
  t.plan(3);
  await reset();

  await server.start();

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
});

test('database collections: create a new collection -> duplicate', async t => {
  t.plan(2);
  await reset();

  await server.start();

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
});
