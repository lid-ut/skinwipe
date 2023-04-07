const fetch = require('node-fetch');

module.exports = async content => {
  return fetch('https://discord.com/api/webhooks/873130723383599104/rNY3JbZy4AfWKYrTd1X3XKrFJu3jt9sbvLXr782-xkb29m6iakO6xOAP3hy5BAXy4r9K', {
    method: 'POST',
    body: JSON.stringify({
      content,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
};
