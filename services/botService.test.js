const assetRepository = require("../repositories/asset");
const transactionRepository = require("../repositories/transaction");
const botService = require("./botService");
const db = require("../database/database");
const { Currency } = require('../valueObjects/currency');
const { TransactionType } = require('../models/transaction');
const Big = require('big.js');


describe('botService', () => {
    beforeEach(async () => {

        try {
            await db.sequelize.sync({ force: true })
            await db.sequelize.authenticate();

        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    it('it should update amount of asset', async () => {
        const result = await assetRepository.create(42, Currency.BTC);
        
        botService.updateBalance(result, 24);
        const finalResult = await assetRepository.getBTCAsset();
        console.log(finalResult);
        expect(finalResult.currency).toEqual(Currency.BTC);
        expect(finalResult.amount).toEqual(24);
    });

    it('it should buy BTC if it has none', async () => {
        await botService.evaluate();
        const result = await transactionRepository.latest(TransactionType.BUY);

        expect(result[0].type).toEqual(TransactionType.BUY);
        expect(result[0].asset).toEqual(Currency.BTC);
        expect(result[0].price_currency).toEqual(Currency.USD);
        expect(typeof result[0].price).toBe('number');
    });

    it('it should sell BTC after buying for a lower price', async () => {
        await transactionRepository.buy(Currency.BTC, Currency.USD, 100);
        const btcAsset = await assetRepository.create(1, Currency.BTC);
        botService.setBtcAsset(btcAsset);
        let tickData = {
            bid:'105.0001',
            ask:'0',
        }
        botService.setTickData(tickData)
        await botService.nextMove()
        const result = await transactionRepository.latest(TransactionType.SELL);

        expect(result[0].type).toEqual(TransactionType.SELL);
        expect(result[0].asset).toEqual(Currency.BTC);
        expect(result[0].price_currency).toEqual(Currency.USD);
        expect(result[0].price).toEqual(105.0001);
    });

    it('it should buy BTC after selling for higher price', async () => {
        await transactionRepository.buy(Currency.BTC, Currency.USD, 80);
        await transactionRepository.sell(Currency.BTC, Currency.USD, 105.0001);
        const btcAsset = await assetRepository.create(0, Currency.BTC);
        botService.setBtcAsset(btcAsset);
        let tickData = {
            bid:'0',
            ask:'100.0000',
        }
        botService.setTickData(tickData)
        await botService.nextMove()
        const result = await transactionRepository.latest(TransactionType.BUY);

        expect(result[0].type).toEqual(TransactionType.BUY);
        expect(result[0].asset).toEqual(Currency.BTC);
        expect(result[0].price_currency).toEqual(Currency.USD);
        expect(result[0].price).toEqual(100);
    });
});