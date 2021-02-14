const { Currency } = require('../valueObjects/currency');

const Entity = (sequelize, type) => {
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
            type: type.DECIMAL(12, 8),
            allowNull: false,
        },
    })
}

module.exports = {
    Entity
}