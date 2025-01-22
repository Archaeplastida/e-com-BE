require("dotenv").config();

const DB_URI = process.env.NODE_ENV === "test" ? "ecom_db_test" : "ecom_db";
const BCRYPT_WORK_FACTOR = process.env.BCRYPT_WORK_FACTOR;
const PASSWORD = process.env.PASSWORD;
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY;

const config = {
    DB_URI,
    BCRYPT_WORK_FACTOR,
    PASSWORD,
    PORT,
    SECRET_KEY
}

module.exports = config;