const db = require('../database/database');

module.exports.create = async (bid, ask) => {

  const result = await db.ticks.create({
    bid,
    ask,
  });

  return result;
};

