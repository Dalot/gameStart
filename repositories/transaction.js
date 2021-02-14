const db = require('../database/database');
const { TransactionType } = require('../models/transaction');

module.exports.buy = async (asset, bidCurrency, price) => {

  const result = await db.transactions.create({
    type: TransactionType.BUY,
    asset: asset,
    price_currency: bidCurrency,
    price: price,
  });

  return result;
};

module.exports.sell = async (asset, askCurrency, price) => {

  const result = await db.transactions.create({
    type: TransactionType.SELL,
    asset: asset,
    price_currency: askCurrency,
    price: price,
  });

  return result;
};

module.exports.latest = async (type) => {
  return await db.transactions.findAll({
    limit: 1,
    where: {
      type: type,
    },
    order: [['createdAt', 'DESC']]
  });
}
