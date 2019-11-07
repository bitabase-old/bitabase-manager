const validateKeyInList = (list, object, key) => {
  if (!list.includes(key)) {
    return { [key]: `key '${key}' is not one of ${list.join(', ')}` }
  }
}

module.exports = validateKeyInList
