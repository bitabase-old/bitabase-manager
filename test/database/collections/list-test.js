const test = require('tape')
const httpRequest = require('../../helpers/httpRequest')
const reset = require('../../helpers/reset')
const { createUserAndSession } = require('../../helpers/session')
const server = require('../../../server')

const createDatabase = (headers, data) =>
  httpRequest('/v1/databases', {
    method: 'post',
    headers,
    data: data || {
      name: 'testing'
    }
  })

const createCollection = (headers, data) => 
  httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers,
    data: {
      name: 'testing'
    }
  })

test('database: list collections -> no session', async t => {
  t.plan(2)
  await reset()

  await server.start()

  const response = await httpRequest('/v1/databases/unknown/collections')

  t.equal(response.status, 401)

  t.deepEqual(response.data, {
    errors: ['invalid session provided']
  })

  await server.stop()
})

test('database: list databases -> not found', async t => {
  t.plan(2)
  await reset()

  await server.start()

  const session = await createUserAndSession()

  const response = await httpRequest('/v1/databases/unknown/collections', {
    method: 'get',
    headers: session.asHeaders
  })

  t.equal(response.status, 404)
  t.equal(response.data.error, 'database not found')

  await server.stop()
})

test('database: list databases', async t => {
  t.plan(9)
  await reset()

  await server.start()

  const session = await createUserAndSession()
  await createDatabase(session.asHeaders)
  await createCollection(session.asHeaders)

  const response = await httpRequest('/v1/databases/testing/collections', {
    method: 'get',
    headers: session.asHeaders
  })

  t.equal(response.status, 200)
  t.equal(response.data.length, 1)
  t.equal(response.data[0].name, 'testing')
  t.equal(response.data[0].total_reads, 0)
  t.equal(response.data[0].total_writes, 0)
  t.equal(response.data[0].total_space, 0)
  t.ok(response.data[0].id)
  t.ok(response.data[0].schema)
  t.ok(response.data[0].date_created)

  await server.stop()
})

test('database: list databases -> only mine', async t => {
  t.plan(9)
  await reset()

  await server.start()

  const firstSession = await createUserAndSession()
  await createDatabase(firstSession.asHeaders)
  await createCollection(firstSession.asHeaders)

  const secondSession = await createUserAndSession()
  await createDatabase(secondSession.asHeaders)
  await createCollection(secondSession.asHeaders)

  const secondResponse = await httpRequest('/v1/databases/testing/collections', {
    method: 'get',
    headers: secondSession.asHeaders
  })

  t.equal(secondResponse.status, 200)
  t.equal(secondResponse.data.length, 1)
  t.equal(secondResponse.data[0].name, 'testing')
  t.equal(secondResponse.data[0].total_reads, 0)
  t.equal(secondResponse.data[0].total_writes, 0)
  t.equal(secondResponse.data[0].total_space, 0)
  t.ok(secondResponse.data[0].id)
  t.ok(secondResponse.data[0].schema)
  t.ok(secondResponse.data[0].date_created)

  await server.stop()
})
