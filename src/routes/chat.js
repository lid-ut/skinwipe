const middlewares = require('./middlewares');
const rooms = require('./chat/rooms');
const roomsV2 = require('./chat/roomsV2');
const roomsV3 = require('./chat/roomsV3');
const removedRooms = require('./chat/removedRooms');
const room = require('./chat/room');
const delRoom = require('./chat/delRoom');
const blackList = require('./chat/blackList');
const blackFlag = require('./chat/blackFlag');
const resetRoomCounters = require('./chat/resetRoomCounters');
const createRoom = require('./chat/createRoom');
const counters = require('./chat/counters');
const messages = require('./chat/messages');

/*
 * @api [get] /api/chat/rooms
 * description: "Список комнат"
 * tags:
 * - chat
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
app.get('/api/chat/rooms', middlewares.checkXAT, rooms);

/*
 * @api [get] /api/chat/rooms/{limit}/{offset}
 * description: "Список комнат (с пагинацией)"
 * tags:
 * - chat
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
 *   name: limit
 *   type: number
 *   required: true
 *   default: ''
 * - in: path
 *   name: offset
 *   type: number
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/chat/rooms/:limit/:offset', middlewares.checkXAT, roomsV2);

/*
 * @api [get] /api/chat/rooms/{limit}/{offset}
 * description: "Список комнат (с пагинацией)"
 * tags:
 * - chat
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
 *   name: limit
 *   type: number
 *   required: true
 *   default: ''
 * - in: path
 *   name: offset
 *   type: number
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/chat/rooms/:id', middlewares.checkXAT, roomsV3);

/*
 * @api [get] /api/chat/rooms/removed
 * description: "Список комнат"
 * tags:
 * - chat
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
app.get('/api/chat/rooms/removed', middlewares.checkXAT, removedRooms);

/*
 * @api [get] /api/chat/room/{roomName}
 * description: "комната"
 * tags:
 * - chat
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
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/chat/room/:roomName', middlewares.checkXAT, room);

/*
 * @api [delete] /api/chat/room/{roomName}
 * description: "комната"
 * tags:
 * - chat
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
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.del('/api/chat/room/:roomName', middlewares.checkXAT, delRoom);

/*
 * @api [get] /api/chat/blackList
 * description: "blackList"
 * tags:
 * - chat
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
app.get('/api/chat/blackList', middlewares.checkXAT, blackList);

/*
 * @api [get] /api/chat/resetRoomCounters/{roomName}
 * description: "Сброс количества непрочитанных сообщений текущей комнаты (когда пришло новое сообщение в текущую комнату)"
 * tags:
 * - chat
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
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/chat/resetRoomCounters/:roomName', middlewares.checkXAT, resetRoomCounters);

/*
 * @api [get] /api/chat/createRoom/{steamId}
 * description: "Создание комнаты чата"
 * tags:
 * - chat
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
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/chat/room/create/:steamId', middlewares.checkXAT, createRoom);

/*
 * @api [get] /api/chat/counters
 * description: "counters"
 * tags:
 * - chat
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
app.get('/api/chat/counters', middlewares.checkXAT, counters);

/*
 * @api [get] /api/chat/messages/{roomName}/{limit}/{offset}
 * description: "сообщения"
 * tags:
 * - chat
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
 *   default: ''
 * - in: path
 *   name: limit
 *   type: number
 *   required: true
 *   default: ''
 * - in: path
 *   name: offset
 *   type: number
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/chat/messages/:roomName/:limit/:offset', middlewares.checkXAT, messages);

/*
 * @api [post] /api/chat/blackList/{steamId}
 * description: "кинуть в блеклист"
 * tags:
 * - chat
 * consumes:
 * - application/json
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
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/chat/blackList/:steamId', middlewares.checkXAT, blackFlag);
