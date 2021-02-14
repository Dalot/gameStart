let dbConfig;

if (process.env.JEST_WORKER_ID !== undefined) {
    dbConfig = require("../config/db.test.config.js");
} else {
    dbConfig = require("../config/db.prod.config.js");
}

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.transactions = require("../models/transaction").Entity(sequelize, Sequelize);
db.ticks = require("../models/tick").Entity(sequelize, Sequelize);
db.assets = require("../models/asset").Entity(sequelize, Sequelize);

module.exports = db;