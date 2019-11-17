const validateObjectProperties = (object, key, validators) => {
  const results = [];

  if (!object[key]) {
    return;
  }

  if (typeof object[key] !== 'object') {
    return { [key]: 'must be an object' };
  }

  validators.forEach(validator => {
    Object.keys(object[key])
      .filter(subKey => {
        const result = validator(object[key], subKey);
        if (result) {
          results.push(result);
        }
      });
  });

  if (results.length > 0) {
    return { [key]: results };
  }
};

module.exports = validateObjectProperties;
