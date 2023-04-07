const middlewares = require('./middlewares');

const getList = require('./quests/getList');
const reward = require('./quests/reward');
const rewardsList = require('./quests/rewardsList');

/*
 * @api [get] /api/quests
 * description: "Получение списка квестов"
 * tags:
 * - quests
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
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/quests', middlewares.checkXAT, getList);

/*
 * @api [get] /api/quests/rewards
 * description: "Список наград"
 * tags:
 * - quests
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
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/quests/rewards', middlewares.checkXAT, rewardsList);

/*
 * @api [get] /api/quests/reward
 * description: "Получение награды за текущий квест"
 * tags:
 * - quests
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
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/quests/reward', middlewares.checkXAT, reward);
