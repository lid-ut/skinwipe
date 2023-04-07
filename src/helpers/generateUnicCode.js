const gen = {
  timecreated: timecreated => {
    const timeCreated = new Date(timecreated * 1000);
    let dd = timeCreated.getDate();
    if (dd < 10) dd = `0${dd}`;

    let mm = timeCreated.getMonth() + 1;
    if (mm < 10) mm = `0${mm}`;

    const yy = timeCreated.getFullYear();
    return `${yy}.${mm}.${dd}_${gen.get()}`;
  },
  get: () => {
    // eslint-disable-next-line no-bitwise
    let firstPart = (Math.random() * 46656) | 0;
    // eslint-disable-next-line no-bitwise
    let secondPart = (Math.random() * 46656) | 0;
    firstPart = `000${firstPart.toString(36)}`.slice(-3);
    secondPart = `000${secondPart.toString(36)}`.slice(-3);
    return firstPart + secondPart;
  },
};

module.exports = gen;
