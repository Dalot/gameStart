const { Currency } = require('../valueObjects/currency');

const TransactionType = {
    BUY: 'BUY',
    SELL: 'SELL',
}

const Entity = (sequelize, type) => {
    return sequelize.define('transaction', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: type.STRING, 
            isIn: [[TransactionType.SELL, TransactionType.BUY]],
            allowNull: false,
        },
        asset:  {
            type: type.STRING,
            isIn: [[Currency.BTC]],
            allowNull: false,
        },
        //TODO: Change price to be a ValueObject
        amount: {
            type: type.DECIMAL(24,8),
            allowNull: false,
        },
        cost: {
            type: type.DECIMAL(12, 5),
            allowNull: false,
        }
        
    })
}

module.exports = {
    TransactionType,
    Entity,
};