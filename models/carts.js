const db = require("../config/db");

class Cart {
    static async add_item({ user_id, product_id }) {
        const check = await db.query(`SELECT id FROM products WHERE id = $1`, [product_id])
        if(check.rowCount < 1 ) return false;
        const result = await db.query(`INSERT INTO cart (user_id, product_id, is_active) VALUES ($1, $2, true) RETURNING user_id, product_id`, [user_id, product_id]);
        return result.rows[0];
    }

    static async remove_item({ user_id, product_id }) {
        const result = await db.query(`UPDATE cart SET is_active = false WHERE user_id = $1 AND product_id = $2 AND is_active = true`, [user_id, product_id]);
        if(result.rowCount > 0) return true;
        return false;
    }

    static async get_items({ user_id }) {
        const result = await db.query(`SELECT p.product_name, p.product_description, p.price FROM products p JOIN cart c ON p.id = c.product_id WHERE c.user_id = $1 AND c.is_active = true`, [user_id]);
        return result.rows;
    }
}

module.exports = Cart;