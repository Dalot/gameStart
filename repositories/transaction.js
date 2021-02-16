const db = require('../database/database');
const { TransactionType } = require('../models/transaction');

module.exports.buy = async (asset, amount, cost) => {

  const result = await db.transactions.create({
    type: TransactionType.BUY,
    asset,
    amount, 
    cost
  });

  return result;
};

module.exports.sell = async (asset, amount, cost) => {

  const result = await db.transactions.create({
    type: TransactionType.SELL,
    asset,
    amount, 
    cost
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
