const db = require("./database/database");
const logger = require("./logger/logger");

if (process.env.APP_ENV !== 'production') {
    db.sequelize.sync({ force: true });
    logger.info("All models were synchronized successfully.");
} else {
    db.sequelize.sync();
}

const bot = require("./services/bot");

const ticker = (interval = 5000) => {
    setInterval(async () => {
        const mustBuy = await bot.evaluate();
    }, interval);
};
ticker()