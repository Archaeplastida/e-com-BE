const db = require("../db");

class Cart {
    static async add_item({user_Id, product_id}){
        const result = await db.query(`INSERT INTO cart (user_id, product_id, is_active) VALUES ($1, $2, true) RETURNING user_id, product_id`, [user_id, product_id]);
        return result.rows[0];
    }

    static async remove_item({user_id, product_id}){
        await db.query(`UPDATE cart SET is_active = false WHERE user_id = $1 AND product_id = $2`, [user_id, product_id]);
        return {message: "Item deleted."}
    }
}

module.exports = Cart;