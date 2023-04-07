const checkXAT = require('./checkXaccessToken');
const checkXATOptional = require('./checkXaccessTokenOptional');
const checkBotAuth = require('./checkBotAuth');
const checkVkAuth = require('./checkVkAuth');
const checkSupportToken = require('./checkSupportToken');
const checkBan = require('./checkBan');

module.exports = {
  checkXAT,
  checkXATOptional,
  checkBotAuth,
  checkVkAuth,
  checkSupportToken,
  checkBan,
};
