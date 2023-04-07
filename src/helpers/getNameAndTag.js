module.exports = item => {
  let name = `${item.name || ''}`;
  let tag = '';
  if (item.Exterior) {
    switch (item.Exterior) {
      case 'battle-scarred':
        name = name.replace(/ \(Battle-Scarred\)/gi, '');
        tag = 'BS';
        break;
      case 'well-worn':
        name = name.replace(/ \(Well-Worn\)/gi, '');
        tag = 'WW';
        break;
      case 'field-tested':
        name = name.replace(/ \(Field-Tested\)/gi, '');
        tag = 'FT';
        break;
      case 'minimal wear':
        name = name.replace(/ \(Minimal Wear\)/gi, '');
        tag = 'MW';
        break;
      case 'factory new':
        name = name.replace(/ \(Factory New\)/gi, '');
        tag = 'FN';
        break;
      default:
        tag = null;
        break;
    }
  } else if (name.indexOf('(Factory New)') !== -1) {
    name = name.replace(/ \(Factory New\)/gi, '');
    tag = 'FN';
  } else if (name.indexOf('(Minimal Wear)') !== -1) {
    name = name.replace(/ \(Minimal Wear\)/gi, '');
    tag = 'FN';
  } else if (name.indexOf('(Field-Tested)') !== -1) {
    name = name.replace(/ \(Field-Tested\)/gi, '');
    tag = 'FN';
  } else if (name.indexOf('(Well-Worn)') !== -1) {
    name = name.replace(/ \(Well-Worn\)/gi, '');
    tag = 'FN';
  } else if (name.indexOf('(Battle-Scarred)') !== -1) {
    name = name.replace(/ \(Battle-Scarred\)/gi, '');
    tag = 'FN';
  }
  return { name, tag };
};
