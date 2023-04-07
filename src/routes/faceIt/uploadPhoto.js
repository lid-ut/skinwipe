const User = require('../../models/User');

const STATUS_NOT_SUBMITTED = 1;
const STATUS_SUBMITTED = 2;
const STATUS_PHOTO_LOADED = 3;
const STATUS_APPROVED = 4;
const STATUS_GOT_PRISE = 5;

module.exports = async function process(req, res) {
    let user = req.user;
    if (!req.files || !req.files.photo) {
        return { status: 'error', message: 'There is no image uploaded' };
    }
    try {
        let photo = req.files.photo;
        let photoUrl = `uploads/${photo.md5}_${photo.name}`;
        
        await photo.mv(`public/${photoUrl}`)
    
        let faceIt = req.user.faceIt || {};
        faceIt.photoUrl = photoUrl;
        faceIt.status = STATUS_PHOTO_LOADED;

        await User.updateOne({ faceIt }).where({ steamId: user.steamId })
        user = await User.findOne({ steamId: user.steamId })
        user.faceIt.photoUrl = `http://${req.headers.host}/${user.faceIt.photoUrl}`
    } catch (e) {
        console.log('FaceIt: Error while uploading image. Error: ' + e);
    }
    
    return {
        status: 'success',
        result: user.faceIt
    };
};