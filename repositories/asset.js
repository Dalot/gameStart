const db = require('../database/database');
const { Currency } = require('../valueObjects/currency');

module.exports.create = async (amount, currency, userId) => {
    const result = await db.assets.create({
        currency,
        amount,
        userId
    });

    return result;
};

module.exports.createOrUpdate = async (asset) => {
    const result = await db.assets
        .findOne({ where: { userId: asset.userId, currency: asset.currency } })
        .then(async (obj) => {
            if (obj) {
                return await obj.update(asset);
            }

            return await db.assets.create(asset)
        })

    return result;
};

module.exports.getBTCAsset = async (userId) => {
    return await db.assets.findOne({ where: {currency: Currency.BTC, userId: userId}});
};

module.exports.getUSDAsset = async (userId) => {
    return await db.assets.findOne({ where: {currency: Currency.USD, userId: userId}});
};

module.exports.update = async (id, newData) => {
    const result = await db.assets.update(newData, {
        where: {
            id: id
        }
    });

    return result;
};