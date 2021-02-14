module.exports = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "uphold",
    PASSWORD: process.env.DB_PASSWORD || "uphold",
    DB: process.env.DB_DATABASE || "uphold",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };