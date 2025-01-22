const db = require("../config/db");

class Product {
    static async create({ seller_id, product_name, product_description, price }) {
        const result = await db.query(`INSERT INTO Products (seller_id, product_name, product_description, price, is_active) VALUES ($1, $2, $3, $4, true) RETURNING seller_id, product_name, product_description, price`, [seller_id, product_name, product_description, price])
        return result.rows[0];
    }
}

module.exports = Product;