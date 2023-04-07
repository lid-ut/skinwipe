const httpBuildQuery = require('http-build-query');
const config = require('../../../config');

function getAuthUrl(redirect) {
  const subpath = 'api/';
  let domainname = config.steam.domainname;
  if (redirect) {
    domainname = config.steam.ruDomainname;
  }

  if (process.env.LOCAL) {
    domainname = config.steam.localhost;
  }
  const params = {
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': domainname + subpath + config.steam.loginpage,
    'openid.realm': domainname,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  };

  if (redirect) {
    params['openid.return_to'] = `${redirect}login.html`;
    params['openid.realm'] = `${redirect}login.html`;
  }
  if (process.env.LOCAL) {
    params['openid.return_to'] = `${redirect}login.local.html`;
    params['openid.realm'] = `${redirect}login.local.html`;
  }

  return `https://steamcommunity.com/openid/login?${httpBuildQuery(params, '', '&')}`;
}

module.exports = async function process(req, res) {
  const redirect = req.query.redirect ? req.query.redirect : false;

  // const redirect = req.query.redirect ? req.query.redirect : false;
  res.cookie('token', '', { expires: 1, httpOnly: false });
  res.send({ status: 'success', steamAuthUrl: getAuthUrl(redirect) });
};
