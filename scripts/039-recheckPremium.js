require('../logger');
const purchaseService = require('in-app-purchase');
const User = require('../src/models/User');
const config = require('../config');

purchaseService.config(config.iap.settings);

const updateSub = async (steamId, subInfo) => {
  await User.updateOne({ steamId }, { subInfo, subscriber: subInfo.length > 0 });
};

async function checkSubMajo() {
  const receipt = {
    data:
      '{"orderId":"GPA.3389-7453-7886-50220","packageName":"com.mezmeraiz.skinswipe","productId":"mezmeraiz.skinswipe.coins_75","purchaseTime":1594895500295,"purchaseState":0,"purchaseToken":"ckjdakmlffmnbccoceloojmd.AO-J1OwBjt6zm9AYureqI1_TELKWayxWQhuSVa2dO2va4iJlPPmY0qBK1M2M5oYRy5BgKDP3AL-2klylroj6S3Gki5jIoxwK5086W4_UtgKW5QCM0SOY2ooV5O8J2NXUF9R1RETkMUJ-sVHh8eV5TIWdTV4PvpfGpA"}',
    signature:
      'USTBcxvwIkPBp2QXNL1gt8Ob4oz0tz6M9NhBZrvhEU9eojr7/sxWi2PG2B8Bg9xdRIAG4oqkVDISJPlP7AEeqVAx4HJGnMsM1q+ME9JNNFbH8hjZ4DXDkCJNEx6ip8I86ZolgJUOJVe5vVoFhNX3g90m56e+ZNfZdb3uNGyr7QUEmJcG4TMGRok62mESfZLx5VbUDbuMDafTrFQE3ABe82uAw275RuiGRR7LVSw4ANmP9ezoxiA82F/TR+a+XV/RsKhhChaCJ0lzIYCZRuD7AGc49RiT78hGjopCP/dZ0wGiimkgNN16zZ5yrLgWGeBNinHLxVH6Ya9M4w9jAB3NUg==',
  };

  await purchaseService.setup();

  let validatedData;
  try {
    validatedData = await purchaseService.validate(receipt);
  } catch (error) {
    if (error.indexOf('Status:410') > -1) {
      logger.info('[recheckPremium] Expired!');
      return false;
    } else {
      const errorJson = JSON.parse(error);
      logger.error(`[recheckPremium][validatePurchase] validate error: ${error} ${errorJson.message}`);
    }
  }
  if (validatedData && validatedData.expirationTime) {
    const expirationTime = parseInt(validatedData.expirationTime, 10);
    if (expirationTime < Date.now()) {
      console.log('expirationTime?', new Date(expirationTime));
    }
  }
  if (validatedData && validatedData.expiryTimeMillis) {
    const expiryTime = parseInt(validatedData.expiryTimeMillis, 10);
    if (expiryTime < Date.now()) {
      console.log('expiryTime?', new Date(expiryTime));
    }
  }
  if (validatedData && validatedData.userCancellationTimeMillis) {
    logger.info(`[recheckPremium] startTimeMillis: (${new Date(parseInt(validatedData.startTimeMillis, 10))})`);
    logger.info(`[recheckPremium] userCancellationTimeMillis: (${new Date(parseInt(validatedData.userCancellationTimeMillis, 10))})`);
    const cancelTime = parseInt(validatedData.userCancellationTimeMillis, 10);
    if (cancelTime) {
    }
    // await removeSub(user);
  }
  console.log(validatedData);
  return true;
}

async function checkSub(user) {
  if (!user || !user.subInfo || !user.subInfo[0]) {
    return;
  }
  subMap = await Promise.all(user.subInfo.map(record => checkSubInfo(record, user)));
  const oldSubLength = user.subInfo.length;
  user.subInfo = user.subInfo.filter((r, i) => subMap[i] === true);
  if (oldSubLength !== user.subInfo.length) {
    console.log(`[checkSub][${user.personaname}][${user.steamId}] old subs: ${oldSubLength} new subs: ${user.subInfo.length}`);
    await updateSub(user.steamId, user.subInfo);
  }
}

async function checkSubInfo(record) {
  if (record.productId && record.productId === 'com.mezmeraiz.skinswipe.premium') {
    const receipt = {
      data: record.JSONdata,
      signature: record.signature,
    };

    await purchaseService.setup();

    let validatedData;
    try {
      validatedData = await purchaseService.validate(receipt);
    } catch (error) {
      if (error.indexOf('Status:410') > -1) {
        logger.info('[recheckPremium] Expired!');
        return false;
      } else {
        logger.error(`[recheckPremium][validatePurchase] validate error: ${error}`);
      }
    }
    if (validatedData && validatedData.expirationTime) {
      const expirationTime = parseInt(validatedData.expirationTime, 10);
      if (expirationTime < Date.now()) {
        console.log('expirationTime?', new Date(expirationTime));
      }
    }
    if (validatedData && validatedData.expiryTimeMillis) {
      const expiryTime = parseInt(validatedData.expiryTimeMillis, 10);
      if (expiryTime < Date.now()) {
        console.log('expiryTime?', new Date(expiryTime));
      }
    }
    if (validatedData && validatedData.userCancellationTimeMillis) {
      logger.info(`[recheckPremium] startTimeMillis: (${new Date(parseInt(validatedData.startTimeMillis, 10))})`);
      logger.info(`[recheckPremium] userCancellationTimeMillis: (${new Date(parseInt(validatedData.userCancellationTimeMillis, 10))})`);
      const cancelTime = parseInt(validatedData.userCancellationTimeMillis, 10);
      if (cancelTime) {
      }
      console.log(validatedData);
      // await removeSub(user);
    }
    return true;
  }
}

const startTime = Date.now();
User.find({ subscriber: true, 'subInfo.productId': 'com.mezmeraiz.skinswipe.premium' }).then(async users => {
  // for (let i = 0; i < users.length; i++) {
  //   const user = users[i];
  //   const percent = (i * 100) / users.length;
  //   logger.info(`[recheckPremium][user][${Math.round(percent)}%][${i} / ${users.length}] ${user.steamId} in ${Date.now() - startTime} ms`);
  //   await checkSub(user);
  // }
  await checkSubMajo();
  logger.info('[recheckPremium] Done!');
  process.exit(1);
});
