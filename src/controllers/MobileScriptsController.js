module.exports.ScriptsControllerV2 = {
  loadInventory: literal => {
    return {
      timing: 0.5,
      script: `
      (function() {
        var message = document.getElementById("error_msg");
        if (message){
          return JSON.stringify({
            "status": "error",
            "message": message.innerText
          });
        }
      
        var steamId = '${literal}';
        var appid = ${literal};
        var contextid = ${literal};
        
        if (appid == 753) {
          contextid = 6;
        }
        var differentArr = [${literal}];        

        if (UserYou.strSteamId === steamId) {
          TradePageSelectInventory(UserYou, appid, contextid);  
        }
        if (UserThem.strSteamId === steamId) {
          TradePageSelectInventory(UserThem, appid, contextid);  
        }
        
        return JSON.stringify({
          "status": "success",
          "message": "inventory loading started"
        });    
      })()`,
    };
  },

  checkInventoryStatus: literal => {
    return {
      timing: 0.5,
      script: `
      (function() {
        var steamId = '${literal}';
        var gameId = '${literal}';
        var contextId = '${literal}';
        if (gameId == 753) {
          contextId = 6;
        }
        var differentArr = [${literal}];
        
        var getGameIdByGameName = function(name) {
          switch(name) {
            case "Counter-Strike: Global Offensive":
              return "730";
              break;
            case "Dota 2":
              return "570";
              break;
          }
        };
        
        var inventory = document.querySelector('#inventory_' + steamId + '_' + gameId + '_' + contextId + ' .inventory_page');
        if (!inventory) {
          var inventoryFiled = document.getElementById("trade_inventory_unavailable");
          if (inventoryFiled && inventoryFiled.style.display !== "none") {
            var reasonBan = document.getElementById("trade_inventory_message_not_allowed")
            if (reasonBan && reasonBan.style.display !== "none") {
              var reasonGameId = getGameIdByGameName(document.querySelector("#trade_inventory_message_not_allowed_none > .gamename").innerText);
              if (reasonGameId == gameId) {
                return JSON.stringify({"status": "error", "message": reasonBan.innerText});
              }
            }
            var reasonFailed = document.getElementById("trade_inventory_failed")
            if (reasonFailed && reasonFailed.style.display !== "none") {
              var reasonGameId = getGameIdByGameName(document.querySelector("#trade_inventory_failed > .gamename").innerText);
              if (reasonGameId == gameId) {
                return JSON.stringify({"status": "error", "message": reasonFailed.innerText});
              }
            }
            var reasonReceiveOnly = document.getElementById("trade_inventory_message_not_allowed_receiveonly")
            if (reasonReceiveOnly && reasonReceiveOnly.style.display !== "none") {
              var reasonGameId = getGameIdByGameName(document.querySelector("#trade_inventory_message_not_allowed_receiveonly > .gamename").innerText);
              if (reasonGameId == gameId) {
                return JSON.stringify({"status": "error", "message": reasonReceiveOnly.innerText});
              }
            }
          }
          return JSON.stringify({
            "status": "error",
            "message": "inventory loading not complete"
          });
        }
        return JSON.stringify({
          "status": "success",
          "message": "inventory loading complete"
        });
      })()
      `,
    };
  },

  itemsSelect: literal => {
    return {
      timing: 0.5,
      script: `
        (function() {
          var event = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
          });
          var steamId = '${literal}';
          var gameId = '${literal}';
          var contextId = '${literal}';
          if (gameId == 753) {
            contextId = 6;
          }
          var itemsAssetIds = [${literal}];
          var differentArr = [${literal}];
          
          var items = document.getElementById('inventory_' + steamId + '_' + gameId + '_' + contextId);
          if (!items) {
            return JSON.stringify({"status": "error", "message": "items not found"});
          }
      
          // Тут проверяем Наличие всех предметов
          for (var i = 0; i < itemsAssetIds.length; i++) {
            var item = document.querySelector('#item' + gameId + '_' + contextId + '_' + itemsAssetIds[i]);
            if (item) {
              item.dispatchEvent(event);
            } else {
              return JSON.stringify({
                "status": "error",
                "message": "not found item " + itemsAssetIds[i]
              });
            }
          }
      
          return JSON.stringify({
            "status": "success",
            "message": ""
          });
        })()
      `,
    };
  },

  getReadyAndSend: () => {
    return {
      timing: 0.5,
      script: `
        (function() {
          ToggleReady(true);
          var newmodal_content_div = document.querySelector(".newmodal_content > div");
          if (newmodal_content_div && newmodal_content_div.innerText.indexOf("trade_warning_item_list") === -1) {
            var cl = document.querySelector('.newmodal_buttons > .btn_green_white_innerfade');
            if (cl) {
              cl.click();
            }
          }
          $('trade_confirmbtn').click()
          
          return JSON.stringify({
            "status": "success",
            "message": "ready and send"
          });
        })()
      `,
    };
  },

  getNewModalInfo: () => {
    return {
      timing: 3.6,
      script: `
        (function() {
          var newmodal_background0 = document.getElementsByClassName('newmodal_background')[0];
          if (!newmodal_background0) {
            return JSON.stringify({
              "status": "error",
              "message": "newmodal background not found"
            });
          }
          var content_body_div = document.querySelector(".newmodal_content > div");
          if (!content_body_div) {
            return JSON.stringify({
              "status": "error",
              "message": "content from new modal not found"
            }); 
          }
          
          if (content_body_div.innerText.indexOf("Steam") === -1) {
            return JSON.stringify({
              "status": "error",
              "message": content_body_div.innerText
            });
          }
          
          return JSON.stringify({
              "status": "success",
              "message": content_body_div.innerText
          });  
        })()
      `,
    };
  },

  clickOkAndRedirect: () => {
    return {
      timing: 1.5,
      script: `
        (function() {
          if (!document.getElementsByClassName('newmodal_background')[0]) {
            return JSON.stringify({
              "status": "error",
              "message": "no newmodal background"
            }); 
          } 
            
          try{
            document.getElementsByClassName('newmodal_background')[0].click(); 
          } catch(e) {
            return JSON.stringify({
              "status": "error",
              "message": e.toString()
            });
          }
          return JSON.stringify({
            "status": "success",
            "message": "wait redirect"
          });
        })();
      `,
    };
  },

  getBanText: () => {
    return {
      timing: 1.5,
      script: `
        (function() {
          var el = document.getElementsByClassName('help_highlight_bans_text')[0];
          if (el) {
            return JSON.stringify({
              "status": "error",
              "message": el.innerText
            }); 
          } 
          return JSON.stringify({
              "status": "success",
              "message": "not found"
            });
        })();
      `,
    };
  },

  checkPersonaname: () => {
    return {
      timing: 1.5,
      script: `
        (function(){
          var ss = 'SkinSwipe';
          var input = document.querySelector("input[name=personaName]");
          if (!input || !input.value) { 
            return { status: 'error', code: 1, message: 'HTML entities not found' };
          }
          var name = input.value;
          if (name.toLowerCase().indexOf(ss.toLowerCase()) !== -1) {
            return { status: 'success', result: name };
          }
          return { status: 'error', code: 2, message: 'SkinSwipe not found' };
        })();
      `,
    };
  },

  getPersonaname: () => {
    return {
      timing: 1.5,
      script: `
        (function(){
          let ss = 'SkinSwipe';
          let input = document.querySelector("input[name=personaName]");
          if (!input || !input.value) {
            return { status: 'error', code: 1, message: 'HTML entities not found' };
          }
          return { status: 'success', result: input.value };
        })();
      `,
    };
  },

  setPersonaname: () => {
    return {
      timing: 1.5,
      script: `
        (function(){
          var ss = 'SkinSwipe';
          var input = document.querySelector("input[name=personaName]");
          var button = document.querySelector('button.Primary');
          if (!button || !input || !input.value){
            return { status: 'error', code: 1, message: 'HTML entities not found' };
          }
          var name = input.value;
          if (name.toLowerCase().indexOf(ss.toLowerCase()) !== -1) {
            return { status: 'success', result: name };
          }
          if (name.length + ss.length > 30) {
            name = name.slice(0, 30 - ss.length);
          }
          name = name + '.' + ss;
          input.value = name;
          button.click();
          return { status: 'success', result: name };
        })();
      `,
    };
  },

  checkTradeBan: () => {
    return {
      timing: 1.5,
      script: `
        (function(){
          var texts = document.getElementsByClassName('error_page_content');
          if (!texts.length) {
            return { status: 'success', escrow: g_daysBothEscrow === 15 };
          }
          var text = texts[0].innerText;
          var matches = text.split(':');
          if (matches.length > 1) {
            text = matches[1];
          }
          return { status: 'error', code: 1, message: text, escrow: g_daysBothEscrow === 15  };
        })();
      `,
    };
  },

  getFriendsSteamIds: () => {
    return {
      timing: 1.5,
      script: `
        (function(){
          var persons = document.getElementsByClassName('persona');
          var steamIds = [];
          for (var i = 0; i < persons.length; i++) {
            if (persons[i] && persons[i].dataset.steamid) {
              steamIds.push(persons[i].dataset.steamid);
            }
          }
          return steamIds;
        })();
      `,
    };
  },
};

module.exports.IOSScriptsController = {
  get: () => {
    const literal = '%@';

    return {
      userData: module.exports.IOSScriptsController.userData(),
      tradeURL: module.exports.IOSScriptsController.tradeURL(),
      getTradeErrors: module.exports.IOSScriptsController.getTradeErrors(),
      clickLogin: module.exports.IOSScriptsController.clickLogin(),
      lastClickConfirm: module.exports.IOSScriptsController.lastClickConfirm(),
      getTradeIDByFirstTrade: module.exports.IOSScriptsController.getTradeIDByFirstTrade(),
      tradeClick: module.exports.IOSScriptsController.tradeClick(),
      checkTradeStatus: module.exports.IOSScriptsController.checkTradeStatus(),
      checkReady: module.exports.IOSScriptsController.checkReady(),
      checkTradeConfirmedText: module.exports.IOSScriptsController.checkTradeConfirmedText(),
      checkNewModal: module.exports.IOSScriptsController.checkNewModal(),
      loadInventory: module.exports.ScriptsControllerV2.loadInventory(literal),
      checkInventoryStatus: module.exports.ScriptsControllerV2.checkInventoryStatus(literal),
      itemsSelect: module.exports.ScriptsControllerV2.itemsSelect(literal),
      getReadyAndSend: module.exports.ScriptsControllerV2.getReadyAndSend(literal),
      getNewModalInfo: module.exports.ScriptsControllerV2.getNewModalInfo(literal),
      clickOkAndRedirect: module.exports.ScriptsControllerV2.clickOkAndRedirect(literal),
      getBanText: module.exports.ScriptsControllerV2.getBanText(literal),
      getPersonaname: module.exports.ScriptsControllerV2.getPersonaname(literal),
      setPersonaname: module.exports.ScriptsControllerV2.setPersonaname(literal),
      checkPersonaname: module.exports.ScriptsControllerV2.checkPersonaname(literal),
      checkTradeBan: module.exports.ScriptsControllerV2.checkTradeBan(literal),
      getFriendsSteamIds: module.exports.ScriptsControllerV2.getFriendsSteamIds(literal),
    };
  },

  userData: () => {
    return {
      timing: 0.5,
      script: `(function () {
      return (document.getElementsByTagName('pre')[0].innerHTML);
    })();`,
    };
  },

  tradeURL: () => {
    return {
      timing: 0.5,
      script: "document.getElementById('trade_offer_access_url').value.toString();",
    };
  },

  getTradeErrors: () => {
    return {
      timing: 1.5,
      script: `(function () {
        if (document.getElementById('error_msg')) return document.getElementById('error_msg').innerText; else return '';
      })();`,
    };
  },

  clickLogin: () => {
    return {
      timing: 0.5,
      script: "document.getElementById('imageLogin').click();",
    };
  },

  lastClickConfirm: () => {
    return {
      timing: 0.5,
      script: `
      (function() {
        var escow_wrapper = document.getElementById('trade_escrow_header');
        if (escow_wrapper && escow_wrapper.style.display !== "none") {
          var escrow_me = document.getElementById('trade_escrow_for_me');
          var escrow_them = document.getElementById('trade_escrow_for_them');
          if (escrow_me) {
            if (escrow_me.style && escrow_me.style.display !== "none") {
              return JSON.stringify({
                "status":    "error",
                "message":   "15 hold me",
                "comment":   escrow_me.innerText
              });
            }
          }
          if (escrow_them) {
            var escrow_them_style = escrow_them.style;
            if (escrow_them_style.display !== "none") {
              return JSON.stringify({
                "status":           "error",
                "message":          "15 hold his",
                "comment" :         escrow_them.innerText
              });
            }
          }
        }
        document.getElementById('you_notready').style.display='block';
        document.getElementById('you_notready').click();
        var cl = document.querySelector('.newmodal_buttons > .btn_green_white_innerfade');
        if (cl) {
          cl.click();
        }
        document.getElementById('trade_confirmbtn').click();
        var text = document.getElementsByClassName('newmodal_content').innerText;
        if (!text) {
          text="";
        }
        var intervalID = setInterval(()=>{
          if (document.getElementsByClassName('newmodal_content')[0]) {
            cl = document.querySelector('.newmodal_buttons > .btn_green_white_innerfade');
            if (cl) {
              cl.click();
            }
            setTimeout(()=>{
              document.getElementsByClassName('newmodal_background')[0].click();
              clearInterval(intervalID);
              document.getElementById('trade_confirmbtn').click();
            }, 500);
          }
        }, 800);
        return JSON.stringify({
          "status":           "success",
          "message":          text
        })
      })();`,
    };
  },

  getTradeIDByFirstTrade: () => {
    return {
      timing: 0.5,
      script: `(function () {
      var childNodes = document.getElementsByClassName('profile_leftcol')[0].childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        if (childNodes[i].className === 'tradeoffer') {
          return JSON.stringify({ 'status': 'success', 'message': childNodes[i].id });
        }
      }
      return JSON.stringify({ 'status': 'error', 'message': 'not found' });
    })();`,
    };
  },

  tradeClick: () => {
    return {
      timing: 0.5,
      script: `(function() {
              var tradeID = '%@'; 
              if (document.getElementById(tradeID)) {
                document.getElementById(tradeID).click();
                return JSON.stringify({ 'status': 'success', 'message': 'wait redirect ' });
              }
              return JSON.stringify({ 'status': 'error', 'message': 'trade not found by id' });
            })()`,
    };
  },

  checkTradeStatus: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var tradeID = '%@';
        if (document.getElementById(tradeID)) {
          if (document.querySelector('#' + tradeID + ' .tradeoffer_items_rule')) {
            return JSON.stringify({
              "status": "error",
              "comment": "not_confirmed",
              "message": "trade not confirmed"
            });
          }
          var tradeDiv = document.querySelector('#' + tradeID + ' .tradeoffer_items_banner');
          var text1 = "no tradeDiv";
          if (tradeDiv) {
            text1 = document.querySelector('#' + tradeID + ' .tradeoffer_items_banner').innerText;
          }
          if (tradeDiv && tradeDiv.className.indexOf("accepted") > -1 ) {
            return JSON.stringify({
              "status": "success",
              "comment": "accepted",
              "message": text1
            });
          } else if (tradeDiv && tradeDiv.className.indexOf("in_escrow") > -1 ) {
            return JSON.stringify({
              "status": "success",
              "comment" : "hold",
              "message": text1
            });
          }
          return JSON.stringify({
            "status": "success",
            "comment" : "rejected",
            "message": text1
          });
        }
        return JSON.stringify({
          "status": "success",
          "comment" : "not_found",
          "message": "trade not found by id"
        });
      })()`,
    };
  },

  checkReady: () => {
    return {
      timing: 1.0,
      script: `
      (function () {
        var you_notready1 = document.getElementById('you_notready');
        if (you_notready1) {
          ToggleReady(true);
          var newmodal_content_div = document.querySelector(".newmodal_content > div");
          if (newmodal_content_div && newmodal_content_div.innerText.indexOf("trade_warning_item_list") === -1) {
            var cl = document.querySelector('.newmodal_buttons > .btn_green_white_innerfade');
            if (cl) {
              cl.click();
            }
          }
          if (document.querySelector('.unknownItem')) {
            return JSON.stringify({
              'status': 'error',
              'message': 'you notready is not ready',
            });
          } else {
            return JSON.stringify({
              'status': 'success',
              'message': 'you notready is ready',
            });
          }
        } else {
          return JSON.stringify({
            'status': 'error',
            'message': 'you_notready not found',
          });
        }
      })();`,
    };
  },

  checkTradeConfirmedText: () => {
    return {
      timing: 0.5,
      script: `
      (function() {
        cl = document.querySelector('.newmodal_buttons > .btn_green_white_innerfade');
        if (cl)
          cl.click();
        var trade_confirmbtn = document.getElementById('trade_confirmbtn');
        if (trade_confirmbtn) {
          document.getElementById('trade_confirmbtn').click();
          return JSON.stringify({
            "status": "success",
            "message": "trade confirmbtn text is ready"
          });
        }else{
          return JSON.stringify({
            "status": "error",
            "message": "trade confirmbtn text not found"
          });
        }
      })()`,
    };
  },

  checkNewModal: () => {
    return {
      timing: 3.6,
      script: `
      (function() {
          var newmodal_background0 = document.getElementsByClassName('newmodal_background')[0];
          if (!newmodal_background0) {
            return JSON.stringify({
              "status": "error",
              "message": "newmodal background not found"
            });
          }
          
          var content_body_div = document.querySelector(".newmodal_content > div");
          if (!content_body_div) {
            return JSON.stringify({
              "status": "error",
              "message": "content from new modal not found"
            }); 
          }
          
          if (content_body_div.innerText.indexOf("Steam") === -1) {
            return JSON.stringify({
              "status": "error",
              "message": content_body_div.innerText
            });
          }
          
          try {
            document.getElementsByClassName('newmodal_background')[0].click(); 
          } catch(e) {
            return JSON.stringify({
              "status": "error",
              "message": e.toString()
            });
          }

          return JSON.stringify({
              "status": "success",
              "message": content_body_div.innerText
          });  
      })()`,
    };
  },
};

module.exports.AndroidScriptsController = {
  get: () => {
    const literal = '%s';

    return {
      loginSetCookie: module.exports.AndroidScriptsController.loginSetCookie(),
      loginRememberClick: module.exports.AndroidScriptsController.loginRememberClick(),
      userGetData: module.exports.AndroidScriptsController.userGetData(),
      userGetTradeURL: module.exports.AndroidScriptsController.userGetTradeURL(),
      tradeClick: module.exports.AndroidScriptsController.tradeClick(),
      tradeCheckStatus: module.exports.AndroidScriptsController.tradeCheckStatus(),

      getBanText: module.exports.ScriptsControllerV2.getBanText(literal),
      getPersonaname: module.exports.ScriptsControllerV2.getPersonaname(literal),
      setPersonaname: module.exports.ScriptsControllerV2.setPersonaname(literal),
      checkPersonaname: module.exports.ScriptsControllerV2.checkPersonaname(literal),
      checkTradeBan: module.exports.ScriptsControllerV2.checkTradeBan(literal),
      getFriendsSteamIds: module.exports.ScriptsControllerV2.getFriendsSteamIds(literal),

      tradeToggleReady: module.exports.AndroidScriptsController.tradeToggleReady(),
      tradeConfirmBtnClick: module.exports.AndroidScriptsController.tradeConfirmBtnClick(),
      tradeGetModalInfo: module.exports.AndroidScriptsController.tradeGetModalInfo(),

      loadInventory: module.exports.ScriptsControllerV2.loadInventory(literal), // rm
      checkInventoryStatus: module.exports.ScriptsControllerV2.checkInventoryStatus(literal), // rm
      itemsSelect: module.exports.ScriptsControllerV2.itemsSelect(literal), // rm
      getReadyAndSend: module.exports.ScriptsControllerV2.getReadyAndSend(literal), // rm
      getNewModalInfo: module.exports.ScriptsControllerV2.getNewModalInfo(literal), // rm
      clickOkAndRedirect: module.exports.ScriptsControllerV2.clickOkAndRedirect(literal), // rm

      // tradeDecline: module.exports.AndroidScriptsController.tradeDecline(), // rm
      // tradeDeclineBtnOkClick: module.exports.AndroidScriptsController.tradeDeclineBtnOkClick(), // rm
      // tradeDeclineGetModalInfo: module.exports.AndroidScriptsController.tradeDeclineGetModalInfo(), // rm
      // tradeCancel: module.exports.AndroidScriptsController.tradeCancel(), // rm
      // tradeCancelOkBtnClick: module.exports.AndroidScriptsController.tradeCancelOkBtnClick(), // rm
      // tradeCancelGetModalInfo: module.exports.AndroidScriptsController.tradeCancelGetModalInfo(), // rm
    };
  },

  loginSetCookie: () => {
    return {
      timing: 500,
      script: 'document.cookie="steamMachineAuthEsliChestno=gabenloh";',
    };
  },

  loginRememberClick: () => {
    return {
      timing: 500,
      script: "document.getElementById('remember_login').click();",
    };
  },

  userGetData: () => {
    return {
      timing: 500,
      script: "(function () { return (document.getElementsByTagName('pre')[0].innerHTML); })();",
    };
  },

  userGetTradeURL: () => {
    return {
      timing: 500,
      script: "(function() { return (document.getElementById('trade_offer_access_url').value); })();",
      url: '',
    };
  },

  tradeClick: () => {
    return {
      timing: 500,
      script: `(function() {
        var tradeID = '%s'; 
        if (document.getElementById(tradeID)) {
          document.getElementById(tradeID).click();
          return JSON.stringify({
            "status": "success",
            "message": "wait redirect "
          });
        }else{
          return JSON.stringify({
            "status": "error",
            "message": "trade not found by id - "
          });
        }
      })()`,
      url: '',
    };
  },

  tradeCheckStatus: () => {
    return {
      timing: 500,
      script: `(function () {
              var tradeID = '%s';
              if (document.getElementById(tradeID)) {
                //1 с трейдом ничего не произошло
                if (document.querySelector('#' + tradeID + ' .tradeoffer_items_rule')) {
                  return JSON.stringify({
                    "status": "error",
                    "comment": "not_confirmed",
                    "message": "trade not confirmed"
                  });
                }
                var tradeDiv = document.querySelector('#' + tradeID + ' .tradeoffer_items_banner');
                var text1 = "no tradeDiv";
                if (tradeDiv) {
                  text1 = document.querySelector('#' + tradeID + ' .tradeoffer_items_banner').innerText;
                }
                if (tradeDiv && tradeDiv.className.replace(/[\\n\\t]/g, " ").indexOf("accepted") > -1) {
                  return JSON.stringify({
                    "status": "success",
                    "comment": "accepted",
                    "message": text1
                  });
                } else if (tradeDiv && tradeDiv.className.replace(/[\\n\\t]/g, " ").indexOf("in_escrow") > -1) {
                  return JSON.stringify({
                    "status": "success",
                    "comment": "hold",
                    "message": text1
                  });
                }
                return JSON.stringify({
                  "status": "success",
                  "comment": "rejected",
                  "message": text1
                });
              }
              return JSON.stringify({
                "status": "error",
                "comment": "not_found",
                "message": "trade not found by id"
              });
            })()`,
      url: '',
    };
  },

  tradeDecline: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var steamTradeId = "%s";
        if (document.getElementById(steamTradeId)) {
          steamTradeId = steamTradeId.replace('tradeofferid_', '');
          DeclineTradeOffer(steamTradeId);
          return JSON.stringify({
            "status" : "success",
            "message" : "trade ready to close"
          });
        }
        return JSON.stringify({
          "status" : "error",
          "message" : "trade not found"
        });
      })()`,
      url: '',
    };
  },

  tradeDeclineBtnOkClick: () => {
    return {
      timing: 500,
      script: `(function() {
        var buttonOk = document.querySelector('.btn_green_white_innerfade.btn_medium');
        if (buttonOk) {
          buttonOk.click();
          return JSON.stringify({
            "status" : "success",
            "message" : "trade button close is clicked"
          });
        }
        return JSON.stringify({
          "status" : "error",
          "message" : "trade button close is not clicked"
        });
      })()`,
      url: '',
    };
  },

  tradeDeclineGetModalInfo: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var newmodal_background0 = document.getElementsByClassName('newmodal_background')[0];
        if (newmodal_background0) {
          var content_body_div = document.querySelector(".newmodal_content > div");
          if (content_body_div) {
            var content_body_div_text = content_body_div.innerText;
            return JSON.stringify({
              "status": "error",
              "message": content_body_div_text
            });
          }
        }
        return JSON.stringify({
          "status": "error",
          "message": "newmodal background not found"
        });
      })()   
      `,
      url: '',
    };
  },

  tradeCancel: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var steamTradeId = "%s";
        if (document.getElementById(steamTradeId)) {
          steamTradeId = steamTradeId.replace('tradeofferid_');
          CancelTradeOffer(steamTradeId);
          return JSON.stringify({
            "status": "success",
            "message": "trade ready to close"
          });
        }
        return JSON.stringify({
          "status": "error",
          "message": "trade not found"
        });
      })()
      `,
      url: '',
    };
  },

  tradeCancelOkBtnClick: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var buttonOk = document.querySelector('.btn_green_white_innerfade.btn_medium');
        if (buttonOk) {
          buttonOk.click();
          return JSON.stringify({
            "status": "success",
            "message": "trade button close is clicked"
          });
        }
        return JSON.stringify({
          "status": "error",
          "message": "trade button close is not clicked"
        });
      })()  
      `,
      url: '',
    };
  },

  tradeCancelGetModalInfo: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var newmodal_background0 = document.getElementsByClassName('newmodal_background')[0];
        if (newmodal_background0) {
          var content_body_div = document.querySelector(".newmodal_content > div");
          if (content_body_div) {
            var content_body_div_text = content_body_div.innerText;
            return JSON.stringify({
              "status": "error",
              "message": content_body_div_text
            });
          }
        }
        return JSON.stringify({
          "status": "error",
          "message": "newmodal background not found"
        });
      })()`,
      url: '',
    };
  },

  tradeToggleReady: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var you_notready1 = document.getElementById('you_notready');
        if (!you_notready1) {
          return JSON.stringify({
            "status": "error",
            "message": "you_notready not found"
          });
        }
        ToggleReady(true);
        var newmodal_content_div = document.querySelector(".newmodal_content > div");
        if (newmodal_content_div && newmodal_content_div.innerText.indexOf("trade_warning_item_list") === -1) {
          var cl = document.querySelector('.newmodal_buttons > .btn_green_white_innerfade');
          if (cl) {
            cl.click();
          }
        }
        if (document.querySelector(".unknownItem")) {
          return JSON.stringify({
            "status": "error",
            "message": "you notready is not ready"
          });
        }
        return JSON.stringify({
          "status": "success",
          "message": "you notready is ready"
        });  
      })()
      `,
      url: '',
    };
  },

  tradeConfirmBtnClick: () => {
    return {
      timing: 500,
      script: `
      (function() {
        cl = document.querySelector('.newmodal_buttons > .btn_green_white_innerfade');
        if (cl) {
          cl.click();
        }
        var trade_confirmbtn = document.getElementById('trade_confirmbtn');
        if (!trade_confirmbtn) {
          return JSON.stringify({
            "status": "error",
            "message": "trade confirmbtn text not found"
          });
        }
        document.getElementById('trade_confirmbtn').click();
        return JSON.stringify({
          "status": "success",
          "message": "trade confirmbtn text is ready"
        });
      })()
      `,
      url: '',
    };
  },

  tradeGetModalInfo: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var newmodal_background0 = document.getElementsByClassName('newmodal_background')[0];
        if (!newmodal_background0) {
          return JSON.stringify({
            "status": "error",
            "message": "newmodal background not found"
          });
        }
        var content_body_div = document.querySelector(".newmodal_content > div");
        if (!content_body_div) {
          return JSON.stringify({
            "status": "error",
            "message": "content_body_div not found"
          });
        }
        var content_body_div_text = content_body_div.innerText;
        if (content_body_div_text.indexOf("7") !== -1) {
          return JSON.stringify({
            "status": "error",
            "message": content_body_div_text
          });
        }
        document.getElementsByClassName('newmodal_background')[0].click();
        return JSON.stringify({
          "status": "success",
          "message": content_body_div_text
        });
      })()
      `,
      url: '',
    };
  },

  tradeGetId: () => {
    return {
      timing: 500,
      script: `
      (function() {
        var childNodes = document.getElementsByClassName('profile_leftcol')[0].childNodes;
        for (var i = 0; i < childNodes.length; i++) {
          if (childNodes[i].className == "tradeoffer") {
            return JSON.stringify({
              "status": "success",
              "message": childNodes[i].id
            });
          }
        }
        return JSON.stringify({
          "status": "error",
          "message": "trade not found by id"
        });
      })();
      `,
      url: '',
    };
  },
};
