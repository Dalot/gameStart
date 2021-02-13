const tickRepository = require("./tick");
const db = require("../database/database");

describe('Tick CRUD', () => {
    beforeEach(async () => {
        
        try {
            await db.sequelize.sync({ force: true })
            await db.sequelize.authenticate();
            
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    it('should create tick entry in db', async () => {
        await tickRepository.create('4324.24523', '9999.33333')
        const result = await db.ticks.findAll()
        expect(result.length).toEqual(1)
        expect(result[0].bid).toEqual(4324.24523)
        expect(result[0].ask).toEqual(9999.33333)
    });
});