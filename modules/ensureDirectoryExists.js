const path = require('path')
const fs = require('fs')

function ensureDirectoryExists (filename, opts = {}) {
  return new Promise((resolve, reject) => {
    const foldername = opts.resolve === true ? path.dirname(filename) : filename

    fs.mkdir(foldername, { recursive: true }, function (error) {
      if (error && !error.toString().includes('EEXIST')) {
        return reject(error)
      }
      resolve()
    })
  })
}

module.exports = ensureDirectoryExists
