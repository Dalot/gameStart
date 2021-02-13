const transactionRepository = require("./transaction");
const db = require("../database/database");
const {TransactionType, Currency} = require('../models/transaction');


describe('Transaction CRUD', () => {
    beforeEach(async () => {
        
        try {
            await db.sequelize.sync({ force: true })
            await db.sequelize.authenticate();
            
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    it('should create buy transaction in db', async () => {
        await transactionRepository.buy(Currency.BTC, Currency.USD, 4324.24523);
        const result = await db.transactions.findAll()
        expect(result.length).toEqual(1)
        expect(result[0].price).toEqual(4324.24523)
        expect(result[0].price_currency).toEqual(Currency.USD)
        expect(result[0].type).toEqual(TransactionType.BUY)
        expect(result[0].asset).toEqual(Currency.BTC)
    });

    it('should create sell transaction in db', async () => {
        await transactionRepository.sell(Currency.BTC, Currency.USD, 4324.24523)
        const result = await db.transactions.findAll()
        expect(result.length).toEqual(1)
        expect(result[0].price).toEqual(4324.24523)
        expect(result[0].price_currency).toEqual(Currency.USD)
        expect(result[0].type).toEqual(TransactionType.SELL)
        expect(result[0].asset).toEqual(Currency.BTC)
    });
});