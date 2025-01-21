const db = require("../db");

class Review {
    static async create({ user_id, product_id, rating, review_text }) {
        const result = await db.query(`INSERT INTO review (user_id, product_id, rating, review_text, is_active) VALUES ($1, $2, $3, $4, true) RETURNING user_id, product_id, rating, review_text`, [user_id, product_id, rating, review_text]);
        return result.rows[0];
    }
}

module.exports = Review;