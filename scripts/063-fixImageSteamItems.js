require('../logger');
const SteamItem = require('../src/models/SteamItem');

(async () => {
  const items = await SteamItem.find({ image: /community.cloudflare.steamstatic.com/i });

  await Promise.all(
    items.map(it => {
      console.log(it._id);
      it.image = it.image.replace('community.cloudflare.steamstatic.com', 'steamcommunity-a.akamaihd.net');
      return SteamItem.updateOne({ _id: it._id }, { $set: { image: it.image } });
    }),
  );

  console.log('done');
})();
