const UserController = require('../src/controllers/UserController');
const User = require('../src/models/User');

User.findOne({ steamId: '76561198114352036' });

User.findOne(
  {
    steamId: '76561198114352036',
  },
  {
    steamId: 1,
    personaname: 1,
    coinCount: 1,
  },
).then(async user => {
  const obsceneArray = [
    'http',
    'буст',
    'бустер',
    'подари ',
    'хуй',
    'хуе',
    'хуи',
    'хуя',
    'пидор',
    'пидар',
    'пизд',
    'хуел',
    'наеб',
    'нае6',
    'наёб',
    'наё6',
    'заеб',
    'зае6',
    'ебан',
    'ебал',
    'е6ал',
    'ебла',
    'е6ла',
    'ебло',
    'е6ло',
    'ебат',
    'е6ат',
    ' бля',
    'ебу',
    'е6у',
    'ублю',
    'гандон',
    'гондон',
    'мудила',
    'уеб',
    'loot.farm',
    'bitskins.com',
    'gg.bet',
    'tastydrop.ru',
    'tradeit.gg',
    'cs.market',
    'csmarket',
    'pvpro.com',
    'tastydrop.ru',
    'godota2.com',
    'gametame.com',
    'csgoatse.com',
    'skinhub.com',
    'pvpro.com',
    'dota2.com',
    'gamdom.com',
    'csgetto.com',
    'topgame.com',
    'csgofast.com',
    'dota2bestyolo.com',
    'hellcase.com',
    'realdrop.net',
    'bets4.pro',
    'makemy.bet',
    'swap.gg',
    'g2a',
    'g2a.com',
    'godota2.com',
    'dota.house',
    'tastydrop.net',
    'cyberbet.com',
    'tastydrop.io',
    'faceit.com',
    'unikrn.com',
    'gocase.pro',
    'csgorun.ru',
    'csgo.run',
    'trademart',
    'csgocases.com',
    user.myInvitationCode,
  ];

  let personaname = user.personaname;
  for (let i = 0; i < obsceneArray.length; i++) {
    if (personaname.toLowerCase().indexOf(obsceneArray[i]) > -1) {
      personaname = '[censored]';
    }
  }

  console.log(`Done! ${personaname}`);
  process.exit(1);
});
