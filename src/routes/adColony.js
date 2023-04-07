const adColonyReward = require('./ads/adColonyReward');
/*
 * @api [get] /api/adColony/reward
 * description: "Выдача награды за просмотр рекламы adColony"
 * tags:
 * - ads
 * parameters:
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/adColony/reward', adColonyReward);
