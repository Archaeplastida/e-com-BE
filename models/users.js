const db = require("../config/db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config/config");

class User {
    static async register({ user_name, first_name, last_name, email, password }) {
        let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const result = await db.query(`INSERT INTO Users (user_name, first_name, last_name, email, password, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING user_name, password, first_name, last_name`, [user_name, first_name, last_name, email, hashedPassword])
        return result.rows[0];
    }

    static async authenticate({ user_name, password }) {
        const result = await db.query(`SELECT id, password FROM users WHERE user_name = $1 AND is_active = true`, [user_name]);
        if (result.rows.length === 0) return false
        let user = result.rows[0]
        let comparePassword = await bcrypt.compare(password, user.password);
        if (comparePassword) return user.id
        return false;
    }

    static async all() {
        const result = await db.query(`SELECT user_name, first_name, last_name, email FROM users WHERE is_active = true ORDER by user_name`);
        return result.rows;
    }

    static async get({ user_id }) {
        const result = await db.query(`SELECT user_name, first_name, last_name, email, created_at FROM users WHERE id = $1 AND is_active = true`, [user_id]);
        if (!result.rows[0]) throw new ExpressError(`No such user ID: ${user_id}, 404`);
        return result.rows[0];
    }
}

module.exports = User;