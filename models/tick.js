const Entity = (sequelize, type) => {
  return sequelize.define('tick', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bid: {
      type: type.DECIMAL(12, 5),
      allowNull: false,
    },
    ask: {
      type: type.DECIMAL(12, 5),
      allowNull: false,
    }
  })
}

module.exports = {
  Entity
}