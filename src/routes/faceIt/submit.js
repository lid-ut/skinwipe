const User = require('../../models/User');

const STATUS_NOT_SUBMITTED = 1;
const STATUS_SUBMITTED = 2;
const STATUS_PHOTO_LOADED = 3;
const STATUS_APPROVED = 4;
const STATUS_GOT_PRISE = 5;

const STATUS_TEXTS = {};
STATUS_TEXTS[STATUS_NOT_SUBMITTED] = 'Not submitted'
STATUS_TEXTS[STATUS_SUBMITTED] = 'Submitted'
STATUS_TEXTS[STATUS_PHOTO_LOADED] = 'Photo loaded'
STATUS_TEXTS[STATUS_APPROVED] = 'Approved from moderation'
STATUS_TEXTS[STATUS_GOT_PRISE] = 'Got prise'

module.exports = async function process(req) {
    let user = req.user;
    let nickname = req.body.nickname;
    let realName = req.body.realName;
    let faceId = req.body.faceId;
    
    if (!user.faceIt) {
        user.faceIt = {};
    }
    user.faceIt.status = STATUS_SUBMITTED;
    user.faceIt.nickname = nickname;
    user.faceIt.realName = realName;
    user.faceIt.faceId = faceId;
    
    await User.updateOne({ faceIt: user.faceIt }).where({ steamId: user.steamId })
    
    user.faceIt.statusText = STATUS_TEXTS[user.faceIt.status];
    
    return {
        status: 'success',
        result: user.faceIt
    };
};