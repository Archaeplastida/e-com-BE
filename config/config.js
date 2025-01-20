require("dotenv").config();

const DB_URI = process.env.NODE_ENV === "test" ? "ecom_db_test" : "ecom_db";
const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS;
const PASSWORD = process.env.PASSWORD
const PORT = 3000;

const config = {
    DB_URI,
    BCRYPT_ROUNDS,
    PASSWORD,
    PORT
}

module.exports = config;