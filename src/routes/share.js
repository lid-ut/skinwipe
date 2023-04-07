/*
 * @api [get] /share/*
 * description: "Deep Links"
 * tags:
 * - share
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/share/*', {}, async (req, res) => {
  let location = 'https://skinswipe.gg/';
  if (req.headers && req.headers['user-agent']) {
    if (req.headers['user-agent'].indexOf('Android') > -1) {
      location = 'https://go.onelink.me/app/cc7093bd';
    } else if (req.headers['user-agent'].indexOf('iPhone') > -1) {
      location = 'https://go.onelink.me/app/d72c43db';
    } else if (req.headers['user-agent'].indexOf('iPad') > -1) {
      location = 'https://go.onelink.me/app/d72c43db';
    }
  }
  res.setHeader('Location', location);
  res.redirect(301, location);
});
