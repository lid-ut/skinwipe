// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    locale: String,
    textId: String,
    screenId: String,
    platform: String,
    title: String,
    subtitle1: String,
    subtitle2: String,
    subtitle3: String,
    subtitle4: String,
    subtitle5: String,
    moneyTitle: String,
    moneyContent: [String],
    coins1New: String,
    coins1Old: String,
    coins2New: String,
    coins2Old: String,
    coins3New: String,
    coins3Old: String,
    coins4New: String,
    coins4Old: String,
    question1: String,
    question2: String,
    question3: String,
    premiumTitle: String,
    premiumContent: [String],
    premiumBuy: String,

    premiumPageTitle: String,
    premiumTitleNormal: String,
    premiumTitleBold: String,
    premiumItems: [Object],
    premiumRestorePurchases: String,
    premiumForWhatTitle: String,
    premiumForWhat: [Object],

    coinsPageTitle: String,
    coinsPageBalance: String,
    coinsPagePurchases: String,
    coinsItems: [Object],
    coinsAdditionalOfferTitle: String,
    coinsAdditionalOfferSubtitle: String,

    coinsSuccessChangeNameTitle: String,
    coinsSuccessChangeNameBalance: String,
    coinsSuccessChangeNameNewName: String,
    coinsSuccessChangeNameDoneButton: String,

    coinsSuccessTitle: String,
    coinsSuccessPurchaseDetailsTitle: String,
    coinsSuccessPurchaseDetailsSubtitle: String,
    coinsSuccessPurchaseBalance: String,
    coinsSuccessContinueButton: String,

    coinsForWhatTitle: String,
    coinsForWhat: [Object],

    yandexKassa: [Object],

    questionTitle: String,
    questionContent: [String],
    questionBuyPremium1: String,
    questionBuyPremium2: String,
    questionBuyPremium3: String,
    questionBuyPremium4: String,

    premiumBlocks: [Object],
  },
  {
    timestamps: true,
  },
);

Schema.index({ locale: 1 });
Schema.index({ screenId: 1 });

module.exports = mongoose.model('appstrings', Schema);
