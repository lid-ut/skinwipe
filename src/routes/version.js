const packageJson = require('../../package');
const config = require('../../config');

/*
 * @api [get] /api/version
 * description: "Возвращает актуальные версии iOS, Android и API"
 * tags:
 * - version
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/version', (req, res) => {
  res.json({
    status: 'success',
    api: packageJson.version,
    android: config.appVersions.android,
    ios: config.appVersions.ios,
  });
});
