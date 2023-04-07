const categories = require('./categories');

module.exports = cats => {
  const findObject = {};
  let nameString = '';
  let typeString = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const cat of cats) {
    const categoryBase = categories.filter(it => it.name === cat.name)[0];
    cat.type = categoryBase ? categoryBase.type : cat.type;
    cat.name = categoryBase ? categoryBase.name : '';
    if (!cat.items || cat.items.length === 0) {
      cat.items = categoryBase ? categoryBase.items : [];
    }
    cat.type = cat ? cat.type : [];
    if (cat.name === 'other') {
      // eslint-disable-next-line no-loop-func
      cat.items.forEach(item => {
        typeString += typeString ? `|${item}` : item;
      });
    } else {
      if (!typeString) {
        typeString = `${cat.type}`;
      } else {
        typeString += `|${cat.type}`;
      }

      // eslint-disable-next-line no-loop-func
      cat.items.forEach(item => {
        // eslint-disable-next-line no-useless-escape
        nameString += nameString ? `|${item}` : item;
      });
    }
  }
  if (nameString) {
    findObject.name = {
      $regex: nameString,
      $options: 'i',
    };
  }
  if (typeString) {
    findObject.Type = {
      $regex: typeString,
      $options: 'i',
    };
  }
  return findObject;
};
