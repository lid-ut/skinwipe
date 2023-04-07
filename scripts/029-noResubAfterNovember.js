const fs = require('fs');
require('../logger');
const promisify = require('util').promisify;
const Purchases = require('../src/models/Purchase');
const Users = require('../src/models/User');

const writeFileAsync = promisify(fs.writeFile);

function chart(arr, days, us, headers) {
  const counts = {};
  const aret = { l: [], d: [], u: [] };

  if (headers) {
    aret.l = headers;
    for (let i = 0; i < arr.length; i++) {
      counts[arr[i]] = 1 + (counts[arr[i]] || 0);
    }
    for (let k = 0; k < aret.l.length; k++) {
      aret.d.push(counts[aret.l[k]] || 0);
    }
  } else if (us) {
    for (let i = 0; i < arr.date.length; i++) {
      counts[arr.date[i]] = 1 + (counts[arr.date[i]] || 0);
    }

    for (let k = 0; k < Object.keys(counts).length; k++) {
      aret.l.push(Object.keys(counts)[k]);
      aret.d.push(counts[Object.keys(counts)[k]]);
    }

    aret.l.forEach(item => {
      const unq = Array.from(new Set(getUids(item, arr)));
      aret.u.push(unq.length);
    });
  } else {
    for (let i = 0; i < arr.length; i++) {
      counts[arr[i]] = 1 + (counts[arr[i]] || 0);
    }
    for (let k = 0; k < Object.keys(counts).length; k++) {
      aret.l.push(Object.keys(counts)[k]);
      aret.d.push(counts[Object.keys(counts)[k]]);
    }
  }

  if (days) {
    aret.l = aret.l.splice(-days);
    aret.d = aret.d.splice(-days);
    aret.u = aret.u.splice(-days);
  }

  if (aret.l.length < days) {
    days -= aret.l.length;
    for (let i = 0; i < days; i++) {
      aret.l.unshift(0);
      aret.d.unshift(0);
      aret.u.unshift(0);
    }
  }

  return aret;
}

(async function run() {
  let purchases = await Purchases.find(
    {
      success: true,
      'data.productId': /premium/i,
      $or: [
        { 'data.purchaseTime': { $gte: Date.now() - 360 * 24 * 60 * 60 * 1000 } },
        { 'data.purchaseDateMs': { $gte: Date.now() - 360 * 24 * 60 * 60 * 1000 } },
      ],
    },
    {
      steamId: 1,
      token: 1,
      'data.productId': 1,
      'data.expirationTime': 1,
      'data.start': 1,
      'data.expiration': 1,
      'data.purchaseTime': 1,
      'data.purchaseDateMs': 1,
      'data.expiresDateMs': 1,
      'data.paymentState': 1,
      'data.isTrial': 1,
    },
  );

  // START TEST

  console.log('[subs] count:', purchases.length);
  const subsCr = [];
  const subsEx = [];
  const subsLife = [];
  const subsStreak = {};
  const tn = new Date();
  const today = tn.setHours(23, 59, 0); // timestamp
  const todayStart = tn.setHours(0, 0, 0); // timestamp
  const todayDM = `${new Date(today).getDate()}.${new Date(today).getMonth() + 1}`;
  if (!purchases) purchases = [];

  purchases = purchases
    .map(item => {
      const data = item.data[0] || item.data[1] || item.data;
      item.created = parseInt(data.purchaseTime || data.purchaseDateMs, 10);
      item.isTrial = data.isTrial || null;
      if (item.isTrial !== null) {
        item.trial = item.isTrial;
      } else {
        item.trial = parseInt(data.paymentState, 10) === 2;
      }
      return item;
    })
    .filter(item => {
      return item.created;
    });

  const userSteamIds = [...new Set(purchases.map(item => item.steamId))];

  console.log('userSteamIds:', userSteamIds.length);
  const users = await Users.find({
    steamId: { $in: userSteamIds },
    // 'subInfo.productId': /premium/i,
    // subscriber: true,
    lastActiveDate: { $gte: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000) },
  });
  console.log('users:', users.length);

  purchases = purchases
    .map(item => {
      item.user = users.find(u => u.steamId === item.steamId);
      const data = item.data[0] || item.data[1] || item.data;
      if (item.user && item.user.subscriber) {
        const subInfo = item.user.subInfo[0] || item.user.subInfo[1] || item.user.subInfo;
        item.isTrial = data.isTrial || null;
        if (item.isTrial !== null) {
          item.trial = subInfo.isTrial;
        } else {
          item.trial = parseInt(subInfo.paymentState, 10) === 2;
        }
        item.expired = parseInt(subInfo.expiration || subInfo.expirationTime || subInfo.expiresDateMs, 10);
      } else {
        item.expired = parseInt(data.expiration || data.expirationTime || data.expiresDateMs, 10);
      }
      return item;
    })
    .filter(item => {
      return item.user;
    })
    .filter(item => {
      const subToken = item.user.subscriber ? item.user.subInfo.token || item.user.subInfo[0].token : item.token;
      return subToken === item.token;
    });

  console.log('purchases:', purchases.length);

  for (let i = 0; i < purchases.length; i++) {
    const item = purchases[i];
    if (item.expired > todayStart && item.expired < today) {
      item.expired = today;
    }
    // item.created = new Date(item.created).setHours(12, 0, 0);
    for (let d = item.created; d <= item.expired; d += 24 * 60 * 60 * 1000) {
      const curDate = new Date(d);
      curDate.setHours(0, 0, 0);
      const moLife = curDate.getMonth() + 1; // 0-11
      const daLife = curDate.getDate(); // 1-31
      if (d > today && todayDM !== `${daLife}.${moLife}`) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (d < todayStart - 48 * 24 * 60 * 60 * 1000) {
        // eslint-disable-next-line no-continue
        continue;
      }
      subsLife.push(`${daLife}.${moLife}`);
    }
  }

  const chLife = chart(subsLife, 48);

  for (let i = 0; i < chLife.l.length; i++) {
    const valueCr = purchases.filter(item => {
      const moCr = new Date(item.created).getMonth() + 1; // 0-11
      const daCr = new Date(item.created).getDate(); // 1-31
      return `${daCr}.${moCr}` === chLife.l[i];
    }).length;
    subsCr.push(valueCr);
    const valueEx = purchases.filter(item => {
      const moEx = new Date(item.expired).getMonth() + 1; // 0-11
      const daEx = new Date(item.expired).getDate(); // 1-31
      return `${daEx}.${moEx}` === chLife.l[i];
    }).length;
    subsEx.push(valueEx);
  }

  let trialSubs = 0;
  let userEmails = '';
  const emailsArray = [];
  for (let i = 0; i < purchases.length; i++) {
    const item = purchases[i];
    if (item.expired < todayStart - 48 * 24 * 60 * 60 * 1000) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (item.expired < todayStart) {
      if (item.user.email && emailsArray.indexOf(item.user.email) === -1) {
        // if (item.user.email && item.user.lastActiveDate > item.expired) {
        emailsArray.push(item.user.email);
        const strCreated = `${new Date(item.created).getDate()}.${new Date(item.created).getMonth() + 1}.${new Date(
          item.created,
        ).getFullYear()}`;
        const strExpired = `${new Date(item.expired).getDate()}.${new Date(item.expired).getMonth() + 1}.${new Date(
          item.expired,
        ).getFullYear()}`;
        userEmails += `${item.trial ? 'Trial' : 'Real'};${strCreated};${strExpired};${item.user.email}\n`;
      }
      // eslint-disable-next-line no-continue
      continue;
    }
    if (item.trial) {
      trialSubs++;
    }
    const months = Math.floor((today - item.created) / 1000 / 60 / 60 / 24 / 30);
    if (!subsStreak[months]) {
      subsStreak[months] = 0;
    }
    subsStreak[months]++;
  }

  await writeFileAsync('scripts/emails.txt', userEmails);

  // END TEST

  console.log(subsCr.length);
  console.log(subsEx.length);
  console.log(purchases.length);
  console.log(users.length);
  console.log(subsStreak);
  console.log(trialSubs);

  logger.info('Done!');
  process.exit(1);
})();
