const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = function () {
  return new Promise((resolve, reject) => {
    const dataFolder = path.resolve(__dirname, '../../data')

    fs.rmdir(dataFolder, { recursive: true }, err => {
      if (err) {
        return reject(err)
      }
      mkdirp(dataFolder, resolve)
    })
  })
}
