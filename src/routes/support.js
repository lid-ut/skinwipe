const middlewares = require('./middlewares');
const rooms = require('./support/rooms');
const resolve = require('./support/resolve');
const getRoom = require('./support/getRoom');
const messages = require('./support/messages');
const banList = require('./support/banList');
const bookmarkList = require('./support/bookmarkList');
const ban = require('./support/ban');
const abuse = require('./support/abuse');
const bookmark = require('./support/bookmark');
const globalBan = require('./support/globalBan');
const makeTop = require('./support/makeTop');
const addCoins = require('./support/addCoins');
const savePoints = require('./support/savePoints');

/*
 * @api [get] /api/support/rooms
 * description: "Список комнат"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/rooms', middlewares.checkSupportToken, rooms);

/*
 * @api [get] /api/support/room/{roomName}
 * description: "getRoom"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: roomName
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/room/:roomName', middlewares.checkSupportToken, getRoom);

/*
 * @api [get] /api/support/messages/{roomName}/{limit}/{offset}
 * description: "messages"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: roomName
 *   type: string
 *   required: true
 * - in: path
 *   name: limit
 *   type: number
 *   required: true
 * - in: path
 *   name: offset
 *   type: number
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/messages/:roomName/:limit/:offset', middlewares.checkSupportToken, messages);

/*
 * @api [get] /api/support/resolve/{steamId}
 * description: "resolve"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/resolve/:steamId', middlewares.checkSupportToken, resolve);

/*
 * @api [get] /api/support/banList
 * description: "banList"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/banList', middlewares.checkSupportToken, banList);

/*
 * @api [get] /api/support/bookmarkList
 * description: "bookmarkList"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/bookmarkList', middlewares.checkSupportToken, bookmarkList);

/*
 * @api [get] /api/support/ban/{steamId}/{hours}
 * description: "ban"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 * - in: path
 *   name: hours
 *   type: number
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/ban/:steamId/:hours', middlewares.checkSupportToken, ban);

/*
 * @api [get] /api/support/abuse/{steamId}
 * description: "abuse"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/abuse/:steamId', middlewares.checkSupportToken, abuse);

/*
 * @api [get] /api/support/bookmark/{steamId}
 * description: "bookmark"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/bookmark/:steamId', middlewares.checkSupportToken, bookmark);

/*
 * @api [get] /api/support/globalBan/{steamId}
 * description: "globalBan"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/globalBan/:steamId', middlewares.checkSupportToken, globalBan);

/*
 * @api [get] /api/support/makeTop/{steamId}
 * description: "makeTop"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/makeTop/:steamId', middlewares.checkSupportToken, makeTop);

/*
 * @api [get] /api/support/addCoins/{steamId}
 * description: "addCoins"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/addCoins/:steamId', middlewares.checkSupportToken, addCoins);

/*
 * @api [get] /api/support/savePoints/{steamId}/{points}
 * description: "savePoints"
 * tags:
 * - support
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 * - in: path
 *   name: points
 *   type: number
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/support/savePoints/:steamId/:points', middlewares.checkSupportToken, savePoints);
