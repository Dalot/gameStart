const assetRepository = require("../repositories/asset");
const userRepository = require("../repositories/user");
const transactionRepository = require("../repositories/transaction");
const botService = require("./bot");
const db = require("../database/database");
const { Currency } = require('../valueObjects/currency');
const { TransactionType } = require('../models/transaction');
const { UpholdAPI }  = require("./upholdAPI");
const clientCredentials = require("../oauth/clientCredentials");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve() + "/.env" });

describe('botService', () => {
    let user;
    beforeEach(async () => {

        try {
            await db.sequelize.sync({ force: true }).then( async () => {
                user = await userRepository.createOrUpdate({
                    email: "john.doe@domain.com",
                    uphold_id: "dummy_id_1"
                }).then(async (user) => {
                    botService.user = user;
                    return await db.assets.create({
                        currency: Currency.USD,
                        amount: 40.00,
                        userId: user.id
                    })
                })
            })
            await db.sequelize.authenticate();

        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    it('it should update amount of asset', async () => {
        const btcAsset = await assetRepository.create(42, Currency.BTC, user.id);
        
        botService.btcAsset = btcAsset;
        await botService.updateBalance(-20);
        const finalResult = await assetRepository.getBTCAsset(user.id);
        expect(finalResult.currency).toEqual(Currency.BTC);
        expect(finalResult.amount).toEqual(22);
    });

    it('it should buy BTC if it has none', async () => {
        let token = await clientCredentials.getAccessToken();
        UpholdAPI.token = token.access_token;
        botService.user.email = process.env.UPHOLD_ACC_EMAIL;
        await botService.evaluate();
        const result = await transactionRepository.latest(TransactionType.BUY);

        expect(result[0].type).toEqual(TransactionType.BUY);
        expect(result[0].asset).toEqual(Currency.BTC);
        expect(typeof result[0].amount).toBe('number');
        expect(typeof result[0].cost).toBe('number');
    });

    it('it should sell BTC after buying for a lower price', async () => {
        let token = await clientCredentials.getAccessToken();
        UpholdAPI.token = token.access_token;
        botService.user.email = process.env.UPHOLD_ACC_EMAIL;
        await transactionRepository.buy(Currency.BTC, 1, 100);
        const usdAsset = await assetRepository.create(40, Currency.USD, user.id);
        const btcAsset = await assetRepository.create(0.00004113, Currency.BTC, user.id);
        botService.btcAsset = btcAsset;
        let tickData = {
            bid:'105.0001',
            ask:'0',
        };
        botService.tickData = tickData;
        botService.usdAsset = usdAsset;
        await botService.nextMove();
        const result = await transactionRepository.latest(TransactionType.SELL);

        expect(result[0].type).toEqual(TransactionType.SELL);
        expect(result[0].asset).toEqual(Currency.BTC);
    });

    it('it should buy BTC after selling for higher price', async () => {
        let token = await clientCredentials.getAccessToken();
        UpholdAPI.token = token.access_token;
        botService.user.email = process.env.UPHOLD_ACC_EMAIL;
        await transactionRepository.buy(Currency.BTC, 1, 80);
        await transactionRepository.sell(Currency.BTC, 1, 105.0001);
        const usdAsset = await assetRepository.create(40, Currency.USD, user.id);
        const btcAsset = await assetRepository.create(0, Currency.BTC, user.id);
        botService.usdAsset = usdAsset;
        botService.btcAsset = btcAsset;
        
        botService.tickData = {
            bid:'0',
            ask:'100.0000',
            currency: Currency.USD,
        };
        await botService.nextMove();
        const result = await transactionRepository.latest(TransactionType.BUY);

        expect(result[0].type).toEqual(TransactionType.BUY);
        expect(result[0].asset).toEqual(Currency.BTC);
    });
});