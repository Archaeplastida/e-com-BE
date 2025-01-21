const db = require("../db");

class Session {
    static async create({user_id, token}){
        const result = await db.query("INSERT INTO sessions (user_id, token, is_active) VALUES ($1, $2, true) RETURNING user_id, token", [user_id, token]);
        return result.rows[0];
    }
}

module.exports = Session;