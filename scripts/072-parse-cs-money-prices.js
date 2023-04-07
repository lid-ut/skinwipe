require('../logger');
const { Builder, By, Key, until, FileHandler, Capabilities, ChromeOptions, Actions } = require('selenium-webdriver');
let webdriver = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');

const ItemImage = require('../src/models/ItemImage');
const randomUseragent = require('random-useragent');
const fs = require('fs');
const fetch = require('node-fetch');

(async function main() {
  var options = new chrome.Options();
  let ua = randomUseragent.getRandom(function (ua) {
    return ua.browserName === 'Firefox';
  });
  options.addArguments(`--user-agent=${ua}`);
  options.addArguments(`--lang=es`);
  options.addArguments(`--window-size=1920,1600`);
  options.excludeSwitches(['enable-automation']);
  options.setUserPreferences({ useAutomationExtension: false });
  //options.headless()

  var chromeCapabilities = webdriver.Capabilities.chrome();
  var chromeOptions = {
    args: ['--disable-blink-features=AutomationControlled'],
  };
  chromeCapabilities.set('chromeOptions', chromeOptions);

  let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).withCapabilities(chromeCapabilities).build();

  try {
    let categories = [
      'https://wiki.cs.money/weapons/aug',
      //'https://wiki.cs.money/weapons/ak-47',
      //'https://wiki.cs.money/weapons/famas',
      //'https://wiki.cs.money/weapons/galil-ar',
      //'https://wiki.cs.money/weapons/m4a1-s',
      //'https://wiki.cs.money/weapons/m4a4',
      //'https://wiki.cs.money/weapons/sg-553',
      //'https://wiki.cs.money/weapons/awp',
      //'https://wiki.cs.money/weapons/g3sg1',
      //'https://wiki.cs.money/weapons/scar-20',
      //'https://wiki.cs.money/weapons/ssg-08',
      //'https://wiki.cs.money/weapons/pp-bizon',
      //'https://wiki.cs.money/weapons/mac-10',
      //'https://wiki.cs.money/weapons/mp5-sd',
      //'https://wiki.cs.money/weapons/mp7',
      //'https://wiki.cs.money/weapons/mp9',
      //'https://wiki.cs.money/weapons/p90',
      //'https://wiki.cs.money/weapons/ump-45',
      //'https://wiki.cs.money/weapons/r8-revolver',
      //'https://wiki.cs.money/weapons/cz75-auto',
      //'https://wiki.cs.money/weapons/desert-eagle',
      //'https://wiki.cs.money/weapons/dual-berettas',
      //'https://wiki.cs.money/weapons/five-seven',
      //'https://wiki.cs.money/weapons/glock-18',
      //'https://wiki.cs.money/weapons/p2000',
      //'https://wiki.cs.money/weapons/p250',
      //'https://wiki.cs.money/weapons/tec-9',
      //'https://wiki.cs.money/weapons/usp-s',
      //'https://wiki.cs.money/weapons/mag-7',
      //'https://wiki.cs.money/weapons/nova',
      //'https://wiki.cs.money/weapons/sawed-off',
      //'https://wiki.cs.money/weapons/xm1014',
      //'https://wiki.cs.money/weapons/m249',
      //'https://wiki.cs.money/weapons/negev',
    ];
    let linksMap = [];
    for (let k = 0; k < categories.length; k++) {
      let category = categories[k];
      await driver.get(category);
      await driver.sleep(2000);

      let links = await driver.findElements(By.css('.ewYzKJ'));
      for (let i = 0; i < links.length; i++) {
        let link = links[i];
        let itemLink = await driver.executeScript("return arguments[0].getAttribute('href');", link);
        linksMap.push(itemLink);
      }
    }

    let skinQuery = ['.actioncard_card__19Ydi'];
    let priceQuery = ['.styles_price__YsL_z'];
    let moreInfoQuery = ['.csm_ui__confirm__ad09e'];
    let floatQuery = ['.styles_float_value__33Ckw'];
    let infoQuery = ['.styles_row__mNuMr'];
    let nameQuery = ['.styles_name__L5X28'];
    let qualityQuery = ['.styles_quality__xMRPN'];
    let closeButtonQuery = ['.styles_close__2w7q4'];
    for (let k = 0; k < linksMap.length; k++) {
      let link = linksMap[k];
      await driver.get(`https://wiki.cs.money${link}`);
      await driver.sleep(5000);

      let pricesMap = [];
      let buyButton = await driver.findElement(By.css('#buy_button'));
      if (!buyButton) {
        continue;
      }
      let itemLink = await driver.executeScript("return arguments[0].getAttribute('href');", buyButton);
      await driver.get(itemLink);
      await driver.sleep(15000);

      let items = [];
      for (let i = 0; i < moreInfoQuery.length; i++) {
        let cards = await driver.findElements(By.css(moreInfoQuery[i]));
        if (!cards) {
          continue;
        }
        for (let j in cards) {
          await driver.actions().move({ origin: cards[j] }).perform();
          await cards[j].click();
          await driver.sleep(5000);

          let item = {};

          for (let z in nameQuery) {
            let nameElement = await driver.findElement(By.css(nameQuery[z]));
            if (nameElement) {
              item.name = await nameElement.getText();
              break;
            }
          }

          for (let z in infoQuery) {
            let infoElements = await driver.findElements(By.css(infoQuery[z]));
            if (infoElements) {
              for (let u in infoElements) {
                let children = await infoElements[u].findElements(By.tagName('span'));
                let name = await children[0].getText();
                let value = await children[1].getText();
                if (name === 'Редкость') {
                  item.rarity = value;
                }
                if (name === 'Паттерн') {
                  item.pattern = value;
                }
              }
              break;
            }
          }

          for (let z in floatQuery) {
            let floatElement = await driver.findElement(By.css(floatQuery[z]));
            if (floatElement) {
              let float = await floatElement.getText();
              item.float = float;
              break;
            }
          }

          for (let z in priceQuery) {
            let priceElement = await driver.findElement(By.css(priceQuery[z]));
            if (priceElement) {
              let priceSpan = await priceElement.findElement(By.tagName('span'));
              let price = await priceSpan.getText();
              item.price = price;
              break;
            }
          }

          for (let z in qualityQuery) {
            let qualityElement = await driver.findElement(By.css(qualityQuery[z]));
            if (qualityElement) {
              let qualityElements = await qualityElement.findElements(By.tagName('span'));
              let type = await qualityElements[0].getText();
              item.type = type;
              break;
            }
          }

          for (let z in closeButtonQuery) {
            let closeButtonElement = await driver.findElement(By.css(closeButtonQuery[z]));
            if (closeButtonElement) {
              await closeButtonElement.click();
              await driver.sleep(1000);
              break;
            }
          }

          items.push(item);
        }
        if (cards) {
          break;
        }
      }
      console.log('Category: ' + link, items);
    }

    /*for (let i = 0; i < linksMap.length; i++) {
      let link = linksMap[i];
      await driver.get(`https://wiki.cs.money${link}`);
      await driver.sleep(5000);

      let generalTitle = null;
      let subTitle = null;
      let title = null;
      let img = null;
      let imgUrl = null;

      let steamImgElement = null;
      let steamImgUrl = null;

      let elementPaths = [
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.cImsGC',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-itybZL.doPlaR',
          subTitle: '.sc-gPWkxV.WkRgK',
          img: '.sc-ipZHIp.cImsGC',
          steamImgElement: '.sc-eMigcr.bBeEmh',
        },
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.cImsGC',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.iNliyD',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.cWjiGc',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.fiKgLl',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.hrcMAE',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.kPXkAx',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.ipmkYa',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-epnACN.cMAivh',
          subTitle: '.sc-hZSUBg.bwTwJY',
          img: '.sc-ipZHIp.doJHCT',
          steamImgElement: '.sc-iQNlJl.gAZxWz',
        },
        {
          generalTitle: '.sc-hZSUBg.cNbLnd',
          subTitle: '.sc-esOvli.gmBjDJ',
          img: '.sc-ipZHIp.cImsGC',
          steamImgElement: '.sc-cMhqgX.jIctQx',
        },
        {
          generalTitle: '.sc-eXEjpC.chKVp',
          subTitle: '.sc-iQKALj.kmZsYP',
          img: '.sc-ipZHIp.cImsGC',
          steamImgElement: '.sc-ibxdXY.kLySxB',
        },
        {
          generalTitle: '.sc-dTdPqK.gamLpz',
          subTitle: '.sc-fzsDOv.gbkHzv',
          img: '.sc-itybZL.bKwEyU',
          steamImgElement: '.sc-itybZL.bKwEyU',
        },
        {
          generalTitle: '.sc-cMhqgX.cDgBGf',
          subTitle: '.sc-cmthru.ledZYf',
          img: '.sc-ipZHIp.hrcMAE',
          steamImgElement: '.sc-iuJeZd.fQllxk',
        },
        {
          generalTitle: '.sc-daURTG.siGFo',
          subTitle: '.sc-eLExRp.gsRlJB',
          img: '.sc-ipZHIp.cImsGC',
          steamImgElement: '.sc-bXGyLb.hMfUNe',
        },
      ];
      for (let j = 0; j < elementPaths.length; j++) {
        let elementsPath = elementPaths[j];
        try {
          generalTitle = await driver.findElement(By.css(elementsPath.generalTitle)).getText();
          subTitle = await driver.findElement(By.css(elementsPath.subTitle)).getText();
          title = generalTitle + ' | ' + subTitle;
          img = await driver.findElement(By.css(elementsPath.img));
          imgUrl = await driver.executeScript("return arguments[0].getAttribute('src');", img);

          steamImgElement = await driver.findElement(By.css(elementsPath.steamImgElement));
          steamImgUrl = await driver.executeScript("return arguments[0].getAttribute('src');", steamImgElement);
          break;
        } catch (e) {
          continue;
        }
      }

      let imageName = `img/skins/${title}.png`;
      if (img && imgUrl) {
        const response = await fetch(imgUrl);
        const buffer = await response.buffer();
        fs.writeFile(`${__dirname}/../public/${imageName}`, buffer, () => console.log('finished downloading!'));

        steamImgUrl = steamImgUrl.replace('/360fx360f', '');
        let itemImage = await ItemImage.findOne({ name: title });
        if (!itemImage) {
          itemImage = new ItemImage({
            appid: 730,
            imageUrl: imageName,
            steamImageUrl: steamImgUrl,
            name: title,
            type: generalTitle,
            skinName: subTitle,
          });
          await itemImage.save();
        }
      }

      if (!generalTitle) {
        console.log('Error while parsing: ' + link);
        return;
      }
    }*/
  } catch (e) {
    console.log(e);
  } finally {
    await driver.quit();
  }
})();
