const db = require("./database/database");
const logger = require("./logger/logger");
const bot = require("./services/bot");
const { Currency } = require("./valueObjects/currency");


db.sequelize.sync({ force: true }).then(() => {
    db.assets.create({
        currency: Currency.USD,
        amount: Number.MAX_SAFE_INTEGER,
    }).then(() => {
        console.log("Added tons of CASH to your account")
        synced = true;
    }).catch(err => {
        console.error(err);
    });
}).catch(err => {
    console.error('Could not sync the database: ', err);
})




const ticker = (interval = 5000) => {
    setInterval(async () => {
        const mustBuy = await bot.evaluate();
    }, interval);
};
ticker()