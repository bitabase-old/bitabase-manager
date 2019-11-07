const validateKeyIsAlphaNumeric = (object, key) => {
  const matches = key.match(/[^a-z0-9]/gi, '')
  if (matches) {
    return { [key]: `key '${key}' can only be alpha numeric` }
  }
}

module.exports = validateKeyIsAlphaNumeric
