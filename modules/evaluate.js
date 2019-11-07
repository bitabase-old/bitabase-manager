const { create, all } = require('mathjs')
const math = create(all)
const limitedEvaluate = math.evaluate

const bcrypt = require('bcrypt')

function bcryptEncrypt (text) {
  return bcrypt.hashSync(text, 10)
}

math.import({
  equal: function (a, b) { return a === b },
  length: function (what) { return what.length },
  includes: function (obj, key, value) {
    return !!(obj && obj[key] && obj[key].includes && obj[key].includes(value))
  },
  bcrypt: function (text) { return bcryptEncrypt(text) },
  unequal: function (a, b) { return a !== b },
  import: function () { throw new Error('Function import is disabled') },
  createUnit: function () { throw new Error('Function createUnit is disabled') },
  evaluate: function () { throw new Error('Function evaluate is disabled') },
  parse: function () { throw new Error('Function parse is disabled') },
  simplify: function () { throw new Error('Function simplify is disabled') },
  derivative: function () { throw new Error('Function derivative is disabled') }
}, { override: true })

module.exports = limitedEvaluate
