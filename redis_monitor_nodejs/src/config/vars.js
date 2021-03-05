const dotenvFlow = require("dotenv-flow");

dotenvFlow.config(); // default will take .env file

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  
  logs: process.env.NODE_ENV === "production" ? "combined" : "dev",
  mongo: process.env.MONGO_URI,
};
