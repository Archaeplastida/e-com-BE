const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config/config");

class User {
    static async register({ user_name, first_name, last_name, email, password }) {
        let hashedPassword = bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const result = await db.query(`INSERT INTO Users (user_name, first_name, last_name, email, password, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING username, password, first_name, last_name`, [user_name, first_name, last_name, email, hashedPassword])
        return result.rows[0];
    }

    static async authenticate({ user_name, password }) {
        const result = await db.query(`SELECT password FROM users WHERE user_name = $1 AND is_active = true`, [user_name]);
        let user = result.rows[0];
        return user && bcrypt.compare(password, user.password);
    }

    static async all() {
        const result = await db.query(`SELECT user_name, first_name, last_name, email FROM users WHERE is_active = true ORDER by user_name`);
        return result.rows;
    }

    static async get(user_name) {
        const result = await db.query(`SELECT user_name, first_name, last_name, email FROM users WHERE user_name = $1 AND is_active = true`, [user_name]);
        if (!result.rows[0]) throw new ExpressError(`No such user: ${user_name}, 404`);
        return result.rows[0];
    }
}

module.exports = User;