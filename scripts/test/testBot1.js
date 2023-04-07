const fetch = require('node-fetch');

const sendAccept = async () => {
  try {
    let result = await fetch(`http://bot1.skinswipe.gg/trade/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerid: '213123',
      }),
    });
    result = await result.json();
    console.log(result);
  } catch (e) {
    console.log(e.toString());
    return { success: false };
  }
};

(async () => {
  await sendAccept();
})();
