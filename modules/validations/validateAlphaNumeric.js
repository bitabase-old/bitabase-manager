const validateAlphaNumeric = (object, key) => {
  const matches = object[key].match(/[^a-z0-9]/gi, '')
  if (matches) {
    return { [key]: 'can only be alpha numeric' }
  }
}

module.exports = validateAlphaNumeric
