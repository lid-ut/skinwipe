require('../logger');
const TodayUsersStat = require('../src/models/TodayUsersStat');

TodayUsersStat.aggregate([
  { $sort: { _id: 1 } },
  {
    $group: {
      _id: { aid: '$date' },
      aid: { $last: '$date' },
      ids: { $addToSet: '$_id' },
      sum: { $sum: 1 },
    },
  },
  {
    $match: { sum: { $gt: 1 } },
  },
]).then(async assets => {
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    logger.info(`[${i + 1}/${assets.length}] asset: ${asset.aid} ${asset.sum}`);
    console.log(asset.ids[0]);
    asset.ids.shift();
    console.log(asset.ids);
    await TodayUsersStat.deleteMany({ _id: { $in: asset.ids } });
  }
  logger.info('Done!');
  process.exit(1);
});
