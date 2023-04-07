var result = { success: false, error: 'try again' };
(() => {
  let postData = { sessionid: g_sessionID, serverid: 1, domain: 'localhost', agreeToTerms: 'agreed' };
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://steamcommunity.com/dev/registerkey', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
  xhr.onload = function () {
    if (xhr.status === 200) {
      const body = xhr.responseText;
      let resText = body.substring(body.lastIndexOf('bodyContents_ex'), body.lastIndexOf('form class="smallForm'));
      resText = resText.substring(resText.indexOf(': ') + 2, resText.indexOf('</p>'));
      result = { success: true, result: resText };
    } else {
      result = { success: false };
    }
  };
  let out = [];
  for (let key in postData) {
    out.push(key + '=' + encodeURIComponent(postData[key]));
  }
  out = out.join('&');
  xhr.send(out);
})();
