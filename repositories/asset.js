const db = require('../database/database');
const { Currency } = require('../valueObjects/currency');

module.exports.create = async (amount, currency) => {
    const result = await db.assets.create({
        currency,
        amount,
    });

    return result;
};

module.exports.getBTCAsset = async () => {
    const results = await db.assets.findAll();
    return results.find(asset => asset.currency === Currency.BTC);
};

module.exports.update = async (id, newData) => {
    return await db.assets.update(newData, {
        where: {
            id: id
        }
    });
};