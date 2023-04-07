require('../logger');
const { Builder, By, Key, until, FileHandler, Capabilities, ChromeOptions } = require('selenium-webdriver');
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
      //'https://wiki.cs.money/weapons/aug',
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
      if (k == 0) {
        await driver.findElement(By.css('.sc-iwsKbI.dnFuxw img')).click();
        await driver.sleep(500);
        await driver.findElement(By.css('.sc-kgoBCf.fsOxZQ img')).click();
      }

      let links = await driver.findElements(By.css('.sc-kPVwWT'));
      for (let i = 0; i < links.length; i++) {
        let link = links[i];
        let itemLink = await driver.executeScript("return arguments[0].getAttribute('href');", link);
        linksMap.push(itemLink);
      }
    }
    console.log('Links to grab: ', linksMap);

    for (let i = 0; i < linksMap.length; i++) {
      let link = linksMap[i];
      await driver.get(`https://wiki.cs.money${link}`);
      await driver.sleep(5000);

      /*try {
        await driver.wait(until.elementIsVisible(driver.findElement(By.css('#screenshot'))), 10000);
        await driver.sleep(1000);
      } catch {
        continue;
      }

      let img = await driver.executeScript("renderer.render(scene, camera); return renderer.domElement.toDataURL();")
      let title = await driver.findElement(By.css('.card-header > h1.m-b-0')).getText()

      let steamImgElement = null;
      try {
        steamImgElement = await driver.findElement(By.css('.item-img>img'))
      } catch (e) {
        steamImgElement = await driver.findElement(By.css('.carousel-item:first-child > img.img-fluid'))
      }*/
      //let img = await driver.executeScript("renderer.render(scene, camera); return renderer.domElement.toDataURL();")
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
    }
  } catch (e) {
    console.log(e);
  } finally {
    await driver.quit();
  }
})();
