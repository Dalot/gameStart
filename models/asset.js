const { Currency } = require('../valueObjects/currency');

const Asset = (sequelize, type) => {
    return sequelize.define('asset', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        currency: {
            type: type.STRING,
            isIn: [[Currency.BTC, Currency.USD]],
            allowNull: false,
        },
        amount: {
            type: type.DECIMAL(24, 8),
            allowNull: false,
        },
        userId: {
            type: type.INTEGER,
            allowNull: false,
        },
    });

};


module.exports = {
    Asset
}