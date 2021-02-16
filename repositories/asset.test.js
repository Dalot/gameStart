const assetRepository = require("./asset");
const userRepository = require("./user");
const db = require("../database/database");
const { Currency } = require('../valueObjects/currency');


describe('Asset CRUD', () => {
    let user;
    beforeEach(async () => {

        try {
            await db.sequelize.sync({ force: true })
            await db.sequelize.authenticate();
            user = await userRepository.createOrUpdate({
                email: "john.doe@domain.com",
                uphold_id: "dummy_id_1"
            })

        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    it('should create asset in db', async () => {
        await assetRepository.create(42, Currency.BTC, user.id);
        const result = await db.assets.findAll();
        expect(result.length).toEqual(1);
        expect(result[0].currency).toEqual(Currency.BTC);
        expect(result[0].amount).toEqual(42);
    });

    it('should update asset in db', async () => {
        const result = await assetRepository.create(42, Currency.BTC, user.id);
        
        await assetRepository.update(result.id, {amount: 24});
        const finalResult = await db.assets.findAll();
        expect(finalResult.length).toEqual(1);
        expect(finalResult[0].currency).toEqual(Currency.BTC);
        expect(finalResult[0].amount).toEqual(24);
    });

    it('should get the BTC asset in db', async () => {
        await assetRepository.create(42, Currency.BTC, user.id);
        
        const result = await assetRepository.getBTCAsset(user.id);
        expect(result.currency).toEqual(Currency.BTC);
        expect(result.amount).toEqual(42);
    });

});