const test = require('tape');
const righto = require('righto');

const httpRequest = require('./helpers/httpRequest');
const { createUserAndSession } = require('./helpers/session');

const createMockRqliteServer = require('./helpers/createMockRqliteServer');
const createServer = require('./helpers/createServer');

const createDatabase = (headers, data) =>
  httpRequest('/v1/databases', {
    method: 'post',
    headers,
    data: data || {
      name: 'testdb'
    }
  });

const createCollection = (headers, database = 'testdb', data) =>
  httpRequest(`/v1/databases/${database}/collections`, {
    method: 'post',
    headers,
    data: data || {
      name: 'testcl'
    }
  });

test('usageBatch: send batch -> database not exist', async t => {
  t.plan(3);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const firstSession = await createUserAndSession();
  await createDatabase(firstSession.asHeaders);
  await createCollection(firstSession.asHeaders);

  const response = await httpRequest('/v1/usage-batch', {
    method: 'post',
    headers: {
      'X-Internal-Secret': 'the-secret-number'
    },
    data: {
      'notfound:testcl:read': 50
    }
  });

  const collectionRead = await httpRequest('/v1/databases/testdb/collections/testcl', {
    headers: firstSession.asHeaders
  });

  t.equal(collectionRead.data.statistics.total_reads, 0);
  t.equal(collectionRead.data.statistics.total_writes, 0);

  t.equal(response.status, 200);

  await server.stop();
  await mockRqlite.stop();
});

test('usageBatch: send batch for one database', async t => {
  t.plan(3);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const firstSession = await createUserAndSession();
  await createDatabase(firstSession.asHeaders);
  await createCollection(firstSession.asHeaders);

  const response = await httpRequest('/v1/usage-batch', {
    method: 'post',
    headers: {
      'X-Internal-Secret': 'the-secret-number'
    },
    data: {
      'testdb:testcl:read': 50,
      'testdb:testcl:write': 5
    }
  });

  const collectionRead = await httpRequest('/v1/databases/testdb/collections/testcl', {
    headers: firstSession.asHeaders
  });

  t.equal(collectionRead.data.statistics.total_reads, 50);
  t.equal(collectionRead.data.statistics.total_writes, 5);

  t.equal(response.status, 200);

  await server.stop();
  await mockRqlite.stop();
});

test('usageBatch: send batch with two databases', async t => {
  t.plan(5);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const firstSession = await createUserAndSession();
  await createDatabase(firstSession.asHeaders);
  await createCollection(firstSession.asHeaders);

  const secondSession = await createUserAndSession();
  await createDatabase(secondSession.asHeaders, { name: 'testdb2' });
  await createCollection(secondSession.asHeaders, 'testdb2', { name: 'testcl2' });

  const response = await httpRequest('/v1/usage-batch', {
    method: 'post',
    headers: {
      'X-Internal-Secret': 'the-secret-number'
    },
    data: {
      'testdb:testcl:read': 50,
      'testdb:testcl:write': 5,
      'testdb2:testcl2:read': 150,
      'testdb2:testcl2:write': 15
    }
  });

  const firstCollectionRead = await httpRequest('/v1/databases/testdb/collections/testcl', {
    headers: firstSession.asHeaders
  });

  t.equal(firstCollectionRead.data.statistics.total_reads, 50);
  t.equal(firstCollectionRead.data.statistics.total_writes, 5);

  const secondCollectionRead = await httpRequest('/v1/databases/testdb2/collections/testcl2', {
    headers: secondSession.asHeaders
  });

  t.equal(secondCollectionRead.data.statistics.total_reads, 150);
  t.equal(secondCollectionRead.data.statistics.total_writes, 15);

  t.equal(response.status, 200);

  await server.stop();
  await mockRqlite.stop();
});
