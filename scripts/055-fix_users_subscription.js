function log(msg) {
    console.log(msg);
}
global.logger = { log, info: log }
const User = require('./src/models/User')
const KassaInvoice = require('./src/models/KassaInvoice')

const premiumMap = {
  139: 1,
  299: 3,
  399: 6,
  690: 12,
};

const premiumAfterTradeBan = {
  69: 1,
  149: 3,
  199: 6,
  299: 12,
};

const premiumSpecialOffer = {
  49: 1,
  99: 3,
  169: 6,
  229: 12,
};

async function main() {
    let users = await User.find({ 'subInfo.0': {$exists: true} })
    console.log(users.length);
    let usersWithBigSubscription = []
    let usersById = {};
    
    for (let i = 0; i < users.length; i++) {
        let user = users[i]
        usersById[user.steamId] = user
        for (let j = 0; j < user.subInfo.length; j++) {
            let subscription = user.subInfo[j];
            let expireDate = parseInt(subscription.expiration || subscription.expirationTime || subscription.expiresDateMs, 10);
            
            if (expireDate >= (new Date(2032, 0, 1)).getTime()) {
                usersWithBigSubscription.push(user.steamId);
            }
        }
    }
    
    for (let i = 0; i < usersWithBigSubscription.length; i++) {
        let steamId = usersWithBigSubscription[i];
        let invoices = await KassaInvoice.find({ steamId, status: 'succeeded' }).sort({ _id: 1 })
        let date = null;
        let wrongSubscription = null;
        let user = usersById[steamId]
        
        console.log('SteamId: ' + steamId);
        for (let j = 0; j < invoices.length; j++) {
            let invoice = invoices[j]
            let createdAt = invoice.createdAt
            let count = invoice.productCount;
            let subscription = user.subInfo.find(function(sub) {
                return sub.transactionId == invoice.id
            })
            if (!subscription) {
                continue;
            }
            let expireDate = parseInt(subscription.expiration || subscription.expirationTime || subscription.expiresDateMs, 10);
            
            if (expireDate >= (new Date(2032, 0, 1)).getTime()) {
                wrongSubscription = subscription
            }

            if (invoice.product == 'premium') {
                let price = parseInt(invoice.amount.value)
                let rightCount = premiumMap[price] || premiumAfterTradeBan[price] || premiumSpecialOffer[price];
                
                if (date && date.getTime() > (new Date(createdAt)).getTime()) {
                    date = new Date(date.setMonth(date.getMonth() + rightCount))
                }
                if (!date || date.getTime() < (new Date(createdAt)).getTime()) {
                    date = new Date(createdAt)
                    date = new Date(date.setMonth(date.getMonth() + rightCount))
                }
                console.log('Invoice date: ', new Date(createdAt) + ', count: ' + count + ', right count: ' + rightCount);
            }
        }
        console.log('Right date: ', date)
        console.log('Subscription to update: ', wrongSubscription.transactionId);
        let subInfo = user.subInfo.map(function(sub) {
            if (sub.transactionId == wrongSubscription.transactionId) {
                sub.expiration = date.getTime()
                sub.expirationTime = date.getTime()
            }
            return sub
        })
        let result = await user.update({ subInfo })
        console.log('Done for steamId: ' + steamId)
    }
    console.log(usersWithBigSubscription, usersWithBigSubscription.length);
}

main()