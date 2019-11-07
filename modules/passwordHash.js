const {promisify} = require('util')
const crypto = require('crypto')

const config = {
  digest: 'sha256',
  hashBytes: 32,
  saltBytes: 16,
  iterations: 372791
}

function hashPassword (password, callback) {
  crypto.randomBytes(config.saltBytes, function(err, salt) {
    if (err) {
      return callback(err)
    }

    crypto.pbkdf2(password, salt, config.iterations, config.hashBytes, config.digest,
      function(err, hash) {

      if (err) {
        return callback(err)
      }

      const combined = Buffer.alloc(hash.length + salt.length + 8)

      combined.writeUInt32BE(salt.length, 0, true)
      combined.writeUInt32BE(config.iterations, 4, true)

      salt.copy(combined, 8)
      hash.copy(combined, salt.length + 8)
      callback(null, combined)
    })
  })
}

function verifyPassword (password, combined, callback) {
  console.log(password)
  const saltBytes = combined.readUInt32BE(0)
  const hashBytes = combined.length - saltBytes - 8
  const iterations = combined.readUInt32BE(4)
  const salt = combined.slice(8, saltBytes + 8)
  const hash = combined.toString('binary', saltBytes + 8)

  crypto.pbkdf2(password, salt, iterations, hashBytes, config.digest, function(err, verify) {
    if (err) {
      return callback(err, false)
    }

    callback(null, verify.toString('binary') === hash)
  })
}

module.exports = {
  hash: promisify(hashPassword),
  verify: promisify(verifyPassword)
}
