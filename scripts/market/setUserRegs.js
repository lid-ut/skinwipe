const fs = require('fs');
require('../../logger');
const MarketItem = require('../../src/models/MarketItem');
const User = require('../../src/models/User');

let fun = async () => {
  const items = await MarketItem.find({ userReg: null });

  const users = await User.find({ steamId: { $in: items.map(it => it.steamid) } });
  console.log(users.length);

  for (const item of items) {
    const user = users.filter(it => it.steamId === item.steamid)[0];

    if (user) {
      await MarketItem.updateOne({ _id: item._id }, { $set: { userReg: user.createdAt } });
    }
  }
};

fun();
