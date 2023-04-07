const User = require('../../src/models/User');

// Ресет уведомлений для активных юзеров
// Выбрать юзеров, которые активны час назад и есть notifications, убрать notifications
module.exports = async callback => {
  const startTime = Date.now();

  const res = await User.updateMany(
    {
      'notifications.1day': true,
      lastActiveDate: {
        $gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    {
      $set: { notifications: {} },
    },
  );

  logger.info(`[resetUserNotifications] end in ${Date.now() - startTime}ms count: ${res.nModified}`);
  callback();
};
