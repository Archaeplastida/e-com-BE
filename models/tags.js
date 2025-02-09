const db = require("../config/db");

class Tag {
    static async create({ tag_name }) {
        const result = await db.query(`INSERT INTO tag (tag_name, is_active) VALUES ($1, true) RETURNING tag_name, id`, [tag_name]);
        return result.rows[0];
    }

    static async all() {
        const result = await db.query(`SELECT id, tag_name FROM tag`);
        return result.rows;
    }
}

module.exports = Tag;