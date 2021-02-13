const TransactionType = {
    BUY: 'BUY',
    SELL: 'SELL',
}

const Currency = {
    BTC: 'Bitcoin',
    USD: 'USD',
    EUR: 'EUR',
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
        price_currency: {
            type: type.STRING,
            isIn: [[Currency.BTC, Currency.EUR, Currency.USD ]],
            allowNull: false,
        },
        //TODO: Change price to be a ValueObject
        price: {
            type: type.DECIMAL(12, 5),
            allowNull: false,
        }
        
    })
}

module.exports = {
    TransactionType,
    Currency,
    Entity,
};