const validateArrayOfStrings = (object, key) => {
  if (!object[key]) {
    return;
  }

  const items = object[key]
    .filter(subKey => {
      return typeof subKey !== 'string';
    });

  if (items.length > 0) {
    return `${key} must be an array of strings`;
  }
};

module.exports = validateArrayOfStrings;
