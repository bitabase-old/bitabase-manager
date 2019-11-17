const crypto = require('crypto');

function createRandomString (length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

module.exports = createRandomString;
