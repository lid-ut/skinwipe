const middlewares = require('./middlewares');
const reward = require('./advertisement/reward');
const rewardCount = require('./advertisement/rewardCount');

/*
 * @api [get] /api/advertisement/reward/{cohort}
 * description: "Реклама"
 * tags:
 * - advertisement
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
 *   name: cohort
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/advertisement/reward/:cohort', middlewares.checkXAT, reward);

/*
 * @api [get] /api/advertisement/rewardCount/{cohort}
 * description: "Реклама"
 * tags:
 * - advertisement
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
 *   name: cohort
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/advertisement/rewardCount/:cohort', middlewares.checkXAT, rewardCount);
