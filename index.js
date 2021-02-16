const db = require("./database/database");
const logger = require("./logger/logger");
const bot = require("./services/bot");
const UpholdAPI = require("./services/upholdAPI");
const clientCredentials = require("./oauth/clientCredentials");
const { Currency } = require("./valueObjects/currency");


db.sequelize.sync({ force: true }).then(() => {
}).catch(err => {
    console.error('Could not sync the database: ', err);
})




const ticker = (interval = 5000) => {
    let upholdUser;
    tokenReady = clientCredentials.getAccessToken();
    let everythingReady = tokenReady.then( async (token) => {
        bot.token = token.access_token;
        return await clientCredentials.getUserInfo(token.access_token).then( async (user) => {
            upholdUser = user;
            await bot.createOrUpdateUser(user).then(async (user) => {
                await bot.createOrUpdateAsset(upholdUser.balances, user.id).catch((err) => {
                    logger.error('Could not createOrUpdate asset:', err);
                })
            }).catch((err) => {
                logger.error('Could not createOrUpdate user:', err);
            })
        }).catch(err => {
            logger.error('Could not get user info:', err);
        })
    }).catch((err) => {
        logger.error('Could not get token:', err);
    })

    everythingReady.then(() => {
        setInterval(async () => {
            const mustBuy = await bot.evaluate();
        }, interval);
    })
};
ticker()