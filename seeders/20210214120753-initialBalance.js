'use strict';

const { Currency } = require("../valueObjects/currency");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('assets', [{
      currency: Currency.USD,
      amount: Number.MAX_SAFE_INTEGER + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('assets', null, {});
  }
};
