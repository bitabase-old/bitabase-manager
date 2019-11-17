/*
  WARNING: This needs to be replaced, it is an unsafe
  quick implementation of something that needs much more
  thought. Do not use in production.
*/

const { BaseError } = require('generic-errors')

function parseBody (request) {
  return new Promise((resolve, reject) => {
    let body = []
    request
      .on('data', function (chunk) {
        body.push(chunk)
      })
      .on('end', function () {
        body = Buffer.concat(body).toString()
        if (body) {
          try {
            body = JSON.parse(body)
          } catch (error) {
            reject(new BaseError({ code: 400, error, body }))
          }
          resolve(body)
        }

        return resolve(undefined)
      })
      .on('error', function (error) {
        reject(error)
      })
  })
}

module.exports = parseBody
