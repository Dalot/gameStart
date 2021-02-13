const Entity = (sequelize, type) => {
    return sequelize.define('tick', {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: type.STRING,
        isIn: [[Currency.BTC, Currency.USD]],
        allowNull: false,
      },
      amount: {
        type: type.DECIMAL(12, 5),
        allowNull: false,
      }
    })
  }
  
  module.exports = {
    Entity
  }