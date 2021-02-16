const db = require('../database/database');

module.exports.createOrUpdate = async (user) => {
    const result = await db.users
    .findOne({where: { uphold_id: user.uphold_id }})
    .then(async (obj) => {
        if (obj) {
            return await obj.update(user);
        }
        
        return await db.users.create(user)
    })

    return result;
};