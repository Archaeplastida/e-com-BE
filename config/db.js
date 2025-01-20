const {Client} = require("pg");
const {DB_URI, PASSWORD} = require("./config");


const db = new Client({ user: 'postgres',
    host: 'localhost',
    database: DB_URI,
    password: PASSWORD,
    port: 5432 });

db.connect();

module.exports = db;
