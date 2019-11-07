const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const readdir = promisify(fs.readdir)

module.exports = async function (req, res, params) {
  const configFile = path.resolve(__dirname, '../../../data/example/')

  let collections = await readdir(configFile)
  collections = collections
    .filter(item => item.endsWith('.db'))
    .map(item => item.replace(/\.db$/, ''))

  res.end(JSON.stringify({
    count: collections.length,
    items: collections
  }))
}
