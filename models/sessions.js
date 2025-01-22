const db = require("../config/db");

class Session {
    static async create({ user_id, token }) {
        const result = await db.query("INSERT INTO sessions (user_id, token, is_active) VALUES ($1, $2, true) RETURNING user_id, token", [user_id, token]);
        return result.rows[0];
    }

    static async deactivate({ user_id }) {
        const result = await db.query("UPDATE sessions SET is_active = false WHERE user_id = $1", [user_id]);
        return true;
    }

    static async verify({ user_id }) {
        const result = await db.query(`SELECT is_active FROM sessions WHERE user_id = $1 AND is_active = true`, [user_id]);
        if (result.rows.length < 1) return false;
        return true;
    }
}

module.exports = Session;