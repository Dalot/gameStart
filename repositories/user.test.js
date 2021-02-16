const userRepository = require("./user");
const db = require("../database/database");

describe('User CRUD', () => {
    beforeEach(async () => {

        try {
            await db.sequelize.sync({ force: true })
            await db.sequelize.authenticate();

        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    it('should create user in db', async () => {
        let user = {
            email: "john.doe@domain.com",
            uphold_id: "59da72d4-986a-48f1-9ce8-2caee100eeef",
        };
        await userRepository.createOrUpdate(user);
        const result = await db.users.findAll();
        expect(result.length).toEqual(1);
        expect(result[0].email).toEqual(user.email);
        expect(result[0].uphold_id).toEqual(user.uphold_id);
    });

    it('should update user in db', async () => {
        let user = {
            email: "john.doe@domain.com",
            uphold_id: "59da72d4-986a-48f1-9ce8-2caee100eeef",
        };
        await userRepository.createOrUpdate(user);
        user.email = "doe.john@domain.com"
        await userRepository.createOrUpdate(user);
        const result = await db.users.findAll();
        expect(result.length).toEqual(1);
        expect(result[0].email).toEqual(user.email);
        expect(result[0].uphold_id).toEqual(user.uphold_id);
    });


});