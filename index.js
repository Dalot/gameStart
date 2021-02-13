const db = require("./database/database");
const transactionRepository = require("./repositories/transaction");
const tickRepository = require("./repositories/tick");
const logger = require("./logger/logger");

if (process.env.APP_ENV !== 'production') {
    db.sequelize.sync({ force: true });
    logger.info("All models were synchronized successfully.");
} else {
    db.sequelize.sync();
}

const UpholdAPI = require("./services/upholdAPI");
const bot = require("./services/botService");

const ticker = (interval = 5000) => {
    setInterval(async () => {
        const mustBuy = bot.mustBuy();

        if (mustBuy) {
            // TODO: VALIDATE
            const result = transactionRepository.buy(tickData.ask)
            transactionRepository.buy(tickData.ask, "USD").then((result) => {
                logger.info(`created transaction entry, bid: ${result.ask}, ask: ${result.type}`);
            })
            console.log(result);
        } else {
            // TODO: VALIDATE
            transactionRepository.sell(data[0].bid)
        }
    }, interval);
};
ticker()