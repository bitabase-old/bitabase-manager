const test = require('tape')
const httpRequest = require('./helpers/httpRequest')
const reset = require('./helpers/reset')
const server = require('../server')

test('list collections: empty', async t => {
  t.plan(1)
  await reset()

  await server.start()

  const response = await httpRequest('/api/collections', {
    method: 'get'
  })

  t.deepEqual(response.data, {
    count: 0,
    items: []
  })

  await server.stop()
})

test('list collections: one db', async t => {
  t.plan(1)
  await reset()

  await server.start()

  // Create a collection
  await httpRequest('/api/collections', {
    method: 'post',
    data: {
      id: 'test',

      // Creating and updating items must conform to this schema
      schema: {
        test: ['required', 'string']
      }
    }
  })

  const response = await httpRequest('/api/collections', {
    method: 'get'
  })

  t.deepEqual(response.data, {
    count: 1,
    items: ['test']
  })

  await server.stop()
})

test('update collection', async t => {
  t.plan(2)

  await reset()

  await server.start()

  await httpRequest('/api/collections', {
    method: 'post',
    data: {
      id: 'test'
    }
  })

  const addFieldsResponse = await httpRequest('/api/collections/test', {
    method: 'put',
    data: {
      id: 'test',

      schema: {
        newfield1: ['required', 'string'],
        newfield2: ['required', 'string']
      }
    },
    validateStatus: status => status < 500
  })

  t.equal(addFieldsResponse.status, 200)

  const removeFieldResponse = await httpRequest('/api/collections/test', {
    method: 'put',
    data: {
      id: 'test',

      schema: {
        newfield1: ['required', 'string']
      }
    },
    validateStatus: status => status < 500
  })

  t.equal(removeFieldResponse.status, 200)

  await server.stop()
})

test('create new collection', async t => {
  t.plan(1)

  await reset()

  await server.start()

  const response = await httpRequest('/api/collections', {
    method: 'post',
    data: {
      id: 'users',

      // Creating and updating items must conform to this schema
      schema: {
        username: ['required', 'string'],
        password: ['required', 'string'],
        permissions: ['required', 'array']
      },

      // These will be run on each record before presenting back to the client
      presenters: [
        'delete data.password'
      ],

      // These will be run on each record before saving to the database
      mutations: [
        'data.password = bcrypt(data.password)'
      ],

      // You can also set rules for each method
      rules: {
        POST: [
          // Allow anyone to register, but only admins to add permissions
          'data.permissions.length === 0 || user.permissions.includes("admin")'
        ],
        PUT: [
          'user.permissions.includes("admin")'
        ],
        PATCH: [
          'user.permissions.includes("admin")'
        ],
        DELETE: [
          'error("can not delete people")'
        ]
      }
    },
    validateStatus: status => status < 500
  })

  t.equal(response.status, 201)

  await server.stop()
})
