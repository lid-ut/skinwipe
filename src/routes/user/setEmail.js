const fetch = require('node-fetch');
const User = require('../../models/User');
const config = require('../../../config');

async function sendEmail(email) {
  try {
    let token = await fetch('https://api.sendpulse.com/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: config.sendPulse.cId,
        client_secret: config.sendPulse.cSecret,
      }),
    });

    if (!token || token.status !== 200) {
      return;
    }

    const text = await token.text();
    if (text.indexOf('{') !== 0) {
      return;
    }
    token = JSON.parse(text);

    token = token.access_token;
    if (!token) {
      return;
    }

    await fetch(`https://api.sendpulse.com/addressbooks/${config.sendPulse.listId}/emails`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: config.sendPulse.listId,
        emails: [
          {
            email,
          },
        ],
      }),
    });
  } catch (e) {
    logger.error(`[SendPulse][sendEmail] could not send email to SendPulse! (${email})`);
  }
}

module.exports = async function process(req) {
  if (!req.body.email || req.body.email.length < 5) {
    return { status: 'error', error: { code: 3, message: 'no email' } };
  }
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        email: req.body.email,
      },
    },
  );
  await sendEmail(req.body.email);
  return { status: 'success', email: req.body.email };
};
