require('../logger');
const FCM = require('fcm-node');
const config = require('../config');

const fcmProvider = new FCM(config.firebaseKey);

// const expiredToken = 'clf3NhPh48g:APA91bHRKCDME80ugzObUsUkNOjuNEDp_CpQbx3n6SZORtnlHTVqTH_Fwx6pUAH6CvDDrYKTYD8Ni-ysWxjA7JiRFqbgx2SWaHYCk1A__nTMlpETGUyJSrwbs5EAoPUkb6BrMUR1GO9m';
const expiredToken =
  'fFjuTM9zqxA:APA91bEVEWHG-TpD0yjpzqahN5EopGX5f2SdZTZ18oBXYYOLW5phTyHwGjSK-UjBF_ZpxOVabSUU4pwQw-CdtPj8nb6Xquq95T-r0k1vZkjqckGNonjjxnYZhxJAKmPxovH7dl6i8C9g';

fcmProvider.send(
  {
    data: {
      event: '7',
      title: 'test',
      content: 'test',
    },
    to: expiredToken,
  },
  error => {
    if (error) {
      logger.error('[sendPush][sendAndroid] fail: %j', error);
    } else {
      logger.info('[sendPush][sendAndroid] success');
    }
    logger.info('Done!');
    process.exit(1);
  },
);
