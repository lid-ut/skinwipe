require('../logger');
const SteamMarketItem = require('../src/models/SteamItem');
const UserSteamItems = require('../src/models/UserSteamItems');
const fs = require('fs');
const fabric = require('fabric').fabric;
const out = fs.createWriteStream(__dirname + '/../public/img/skins/helloworld.png');
const datauri = require('datauri');

const positions = {
  awp: {
    1: {
      left: 770,
      top: 410,
      size: 80,
    },
    2: {
      left: 850,
      top: 500,
      size: 100,
    },
    3: {
      left: 958,
      top: 504,
      size: 100,
    },
    4: {
      left: 1235,
      top: 516,
      size: 100,
    },
  },
  ak47: {
    1: {
      left: 455,
      top: 463,
      size: 100,
    },
    2: {
      left: 662,
      top: 471,
      size: 100,
    },
    3: {
      left: 819,
      top: 471,
      size: 100,
    },
    4: {
      left: 957,
      top: 471,
      size: 100,
    },
  },
  m4a4: {
    1: {
      left: 680,
      top: 551,
      size: 120,
    },
    2: {
      left: 759,
      top: 476,
      size: 100,
    },
    3: {
      left: 869,
      top: 514,
      size: 120,
    },
    4: {
      left: 1165,
      top: 468,
      size: 120,
    },
  },
  p2000: {
    1: {
      left: 245,
      top: 158,
      size: 230,
    },
    2: {
      left: 475,
      top: 166,
      size: 220,
    },
    3: {
      left: 859,
      top: 166,
      size: 320,
    },
    4: {
      left: 974,
      top: 543,
      size: 320,
      angle: -20,
    },
  },
  negev: {
    1: {
      left: 556,
      top: 477,
      size: 115,
    },
    2: {
      left: 680,
      top: 628,
      size: 120,
    },
    3: {
      left: 856,
      top: 473,
      size: 120,
    },
    4: {
      left: 976,
      top: 473,
      size: 120,
    },
  },
  pp19: {
    1: {
      left: 489,
      top: 522,
      size: 120,
    },
    2: {
      left: 549,
      top: 410,
      size: 120,
    },
    3: {
      left: 669,
      top: 437,
      size: 120,
    },
    4: {
      left: 800,
      top: 423,
      size: 120,
    },
  },
  r8: {
    1: {
      left: 64,
      top: 232,
      size: 200,
    },
    2: {
      left: 355,
      top: 209,
      size: 230,
    },
    3: {
      left: 751,
      top: 257,
      size: 240,
    },
    4: {
      left: 1053,
      top: 451,
      size: 220,
    },
  },
  aug: {
    1: {
      left: 644,
      top: 411,
      size: 190,
    },
    2: {
      left: 872,
      top: 422,
      size: 160,
    },
    3: {
      left: 1070,
      top: 440,
      size: 160,
    },
    4: {
      left: 1261,
      top: 462,
      size: 160,
    },
  },
  cz75: {
    1: {
      left: 594,
      top: 175,
      size: 240,
    },
    2: {
      left: 847,
      top: 190,
      size: 260,
    },
    3: {
      left: 1098,
      top: 230,
      size: 280,
    },
    4: {
      left: 1250,
      top: 710,
      size: 280,
      angle: -20,
    },
  },
  desertEagle: {
    1: {
      left: 236,
      top: 238,
      size: 240,
    },
    2: {
      left: 658,
      top: 252,
      size: 260,
    },
    3: {
      left: 912,
      top: 223,
      size: 280,
    },
    4: {
      left: 1035,
      top: 522,
      size: 280,
      angle: -12,
    },
  },
  dualBeretas: {
    1: {
      left: 490,
      top: 360,
      size: 280,
      angle: 39,
    },
    2: {
      left: 846,
      top: 620,
      size: 240,
      angle: 33,
    },
    3: {
      left: 1034,
      top: 213,
      size: 220,
      angle: 5,
    },
    4: {
      left: 1248,
      top: 355,
      size: 220,
    },
  },
  famas: {
    1: {
      left: 533,
      top: 462,
      size: 140,
    },
    2: {
      left: 647,
      top: 462,
      size: 140,
    },
    3: {
      left: 815,
      top: 453,
      size: 140,
    },
    4: {
      left: 960,
      top: 476,
      size: 180,
    },
  },
  fiveSeven: {
    1: {
      left: 269,
      top: 207,
      size: 270,
    },
    2: {
      left: 650,
      top: 207,
      size: 300,
    },
    3: {
      left: 989,
      top: 234,
      size: 350,
    },
    4: {
      left: 1084.5,
      top: 730,
      size: 350,
      angle: -20,
    },
  },
  g3sg1: {
    1: {
      left: 663,
      top: 502,
      size: 110,
    },
    2: {
      left: 1053,
      top: 508,
      size: 110,
    },
    3: {
      left: 1135,
      top: 419,
      size: 60,
    },
    4: {
      left: 1258,
      top: 531,
      size: 110,
    },
    5: {
      left: 1377,
      top: 543,
      size: 110,
    },
  },
  galiAR: {
    1: {
      left: 548,
      top: 429,
      size: 140,
    },
    2: {
      left: 800,
      top: 443,
      size: 140,
    },
    3: {
      left: 918,
      top: 429,
      size: 140,
    },
    4: {
      left: 1288,
      top: 482,
      size: 140,
    },
  },
  glock18: {
    1: {
      left: 307,
      top: 168,
      size: 310,
    },
    2: {
      left: 666,
      top: 151,
      size: 310,
    },
    3: {
      left: 1012,
      top: 196,
      size: 330,
    },
    4: {
      left: 1030,
      top: 630,
      size: 360,
      angle: -20,
    },
  },
  m4a1s: {
    1: {
      left: 657,
      top: 475,
      size: 110,
    },
    2: {
      left: 808,
      top: 535,
      size: 110,
    },
    3: {
      left: 924,
      top: 509,
      size: 110,
    },
    4: {
      left: 1015,
      top: 492,
      size: 100,
    },
  },
  m249: {
    1: {
      left: 872,
      top: 510,
      size: 110,
    },
    2: {
      left: 958,
      top: 535,
      size: 110,
    },
    3: {
      left: 1056,
      top: 484,
      size: 110,
    },
  },
  usps: {
    1: {
      left: 850,
      top: 334,
      size: 220,
    },
    2: {
      left: 1062,
      top: 334,
      size: 220,
    },
    3: {
      left: 1270,
      top: 356,
      size: 220,
    },
    4: {
      left: 1320,
      top: 631,
      size: 220,
      angle: -15,
    },
  },
  sg553: {
    1: {
      left: 807,
      top: 519,
      size: 130,
    },
    2: {
      left: 864,
      top: 406,
      size: 110,
    },
    3: {
      left: 925,
      top: 503,
      size: 130,
    },
    4: {
      left: 1028,
      top: 526,
      size: 130,
    },
  },
  tec9: {
    1: {
      left: 589,
      top: 196,
      size: 280,
    },
    2: {
      left: 853,
      top: 161,
      size: 260,
    },
    3: {
      left: 1098,
      top: 161,
      size: 260,
    },
  },
  mag7: {
    1: {
      left: 642,
      top: 377,
      size: 220,
    },
    2: {
      left: 828,
      top: 368,
      size: 200,
    },
    3: {
      left: 1004,
      top: 416,
      size: 200,
    },
    4: {
      left: 1174,
      top: 377,
      size: 200,
    },
  },
  p250: {
    1: {
      left: 278,
      top: 128,
      size: 290,
    },
    2: {
      left: 607,
      top: 147,
      size: 320,
    },
    3: {
      left: 944,
      top: 157,
      size: 350,
    },
    4: {
      left: 1063,
      top: 655,
      size: 350,
      angle: -15,
    },
  },
  ssg08: {
    1: {
      left: 703,
      top: 543,
      size: 120,
    },
    2: {
      left: 788,
      top: 588,
      size: 120,
    },
    3: {
      left: 885,
      top: 551,
      size: 120,
    },
    4: {
      left: 1005,
      top: 583,
      size: 80,
    },
  },
  nova: {
    1: {
      left: 699,
      top: 462,
      size: 120,
    },
    2: {
      left: 800,
      top: 462,
      size: 120,
    },
    3: {
      left: 920,
      top: 462,
      size: 120,
    },
  },
  XM1014: {
    1: {
      left: 588,
      top: 481,
      size: 110,
    },
    2: {
      left: 703,
      top: 476,
      size: 110,
    },
    3: {
      left: 813,
      top: 476,
      size: 110,
    },
    4: {
      left: 924,
      top: 476,
      size: 110,
    },
  },
  scar20: {
    1: {
      left: 751,
      top: 495,
      size: 110,
    },
    2: {
      left: 790,
      top: 587,
      size: 110,
    },
    3: {
      left: 888,
      top: 554,
      size: 110,
    },
    4: {
      left: 1062,
      top: 536,
      size: 110,
    },
  },
  sawedOff: {
    1: {
      left: 393,
      top: 504,
      size: 140,
    },
    2: {
      left: 800,
      top: 496,
      size: 160,
    },
    3: {
      left: 939,
      top: 496,
      size: 160,
    },
    4: {
      left: 1083,
      top: 504,
      size: 160,
    },
  },
  p90: {
    1: {
      left: 525,
      top: 456,
      size: 210,
    },
    2: {
      left: 924,
      top: 530,
      size: 260,
    },
    3: {
      left: 1152,
      top: 464,
      size: 200,
    },
    4: {
      left: 1309,
      top: 511,
      size: 200,
    },
  },
  mp7: {
    1: {
      left: 750,
      top: 206,
      size: 230,
    },
    2: {
      left: 829,
      top: 538,
      size: 200,
    },
    3: {
      left: 1061,
      top: 206,
      size: 200,
    },
    4: {
      left: 1235,
      top: 281,
      size: 200,
    },
  },
  mp5: {
    1: {
      left: 503,
      top: 423,
      size: 160,
    },
    2: {
      left: 692,
      top: 423,
      size: 160,
    },
    3: {
      left: 868,
      top: 440,
      size: 130,
    },
    4: {
      left: 1014,
      top: 440,
      size: 130,
    },
  },
  mp9: {
    1: {
      left: 176,
      top: 329,
      size: 210,
    },
    2: {
      left: 439,
      top: 368,
      size: 210,
    },
    3: {
      left: 484,
      top: 579,
      size: 180,
    },
    4: {
      left: 603,
      top: 315,
      size: 210,
    },
  },
  ump45: {
    1: {
      left: 347,
      top: 311,
      size: 180,
    },
    2: {
      left: 551,
      top: 311,
      size: 180,
    },
    3: {
      left: 694,
      top: 356,
      size: 180,
    },
    4: {
      left: 850,
      top: 315,
      size: 170,
    },
  },
  mac10: {
    1: {
      left: 497,
      top: 191,
      size: 260,
    },
    2: {
      left: 800,
      top: 191,
      size: 260,
    },
    3: {
      left: 858,
      top: 409,
      size: 210,
    },
    4: {
      left: 1015,
      top: 191,
      size: 260,
    },
  },
};

(async function main() {
  //canvas.setBackgroundImage(`file://${__dirname}/../public/img/skins/AWP | ASIIMOV (FIELD-TESTED).png`, canvas.renderAll.bind(canvas));
  let canvasWidth = 1600;
  let canvasHeight = 1000;
  let canvas = new fabric.Canvas('canvas-container', { width: canvasWidth, height: canvasHeight });
  let dataURIImage = await datauri(`${__dirname}/../public/img/skins/P250 | Снежная мгла.png`);
  fabric.Image.fromURL(dataURIImage, function (img) {
    img.scaleToWidth(canvasWidth);
    canvas.add(img);

    fabric.Image.fromURL(
      `https://steamcdn-a.akamaihd.net/apps/730/icons/econ/stickers/berlin2019/sig_boombl4_foil.95c0bb7e3db8ddb90d9b288916deed50469be053.png`,
      function (img) {
        img.set({
          opacity: 0.85,
          left: positions.p250['4'].left,
          top: positions.p250['4'].top,
          angle: positions.p250['4'].angle,
        });
        img.scaleToWidth(positions.p250['4'].size);
        canvas.add(img);

        canvas.renderAll();
        var stream = canvas.createPNGStream();
        stream.on('data', function (chunk) {
          out.write(chunk);
        });
      },
    );
  });
})();
