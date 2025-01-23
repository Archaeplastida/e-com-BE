const db = require("../config/db");

class Product {
    static async create({ seller_id, product_name, product_description, price }) {
        const result = await db.query(`INSERT INTO Products (seller_id, product_name, product_description, price, is_active) VALUES ($1, $2, $3, $4, true) RETURNING seller_id, product_name, product_description, price`, [seller_id, product_name, product_description, price])
        return result.rows[0];
    }

    static async update({ product_id, product_name, product_description, price }) {
        const result = await db.query(`UPDATE Products SET product_name = $1, product_description = $2, price = $3 WHERE id = $4 AND is_active = true RETURNING id, product_name, product_description, price`, [product_name, product_description, price, product_id]);
        return result.rows[0];
    }

    static async delete({ product_id }) {
        await db.query(`UPDATE products SET is_active = false WHERE id = $1 AND is_active = true`, [product_id]);
        return { message: "Product deleted." };
    }

    static async all() {
        const result = await db.query(`SELECT u.user_name, p.product_name, p.product_description, p.price FROM users u JOIN products p ON u.id = p.seller_id WHERE p.is_active = true AND u.is_active = true`);
        return result.rows;
    }

    static async byId({ product_id }) {
        const result = await db.query(`SELECT u.user_name, p.product_name, p.product_description, p.price, p.created_at FROM users u JOIN products p ON u.id = p.seller_id WHERE p.id = $1 AND p.is_active = true AND u.is_active = true`, [product_id]);
        return result.rows[0];
    }

    static async getSellerId({ product_id }) {
        const result = await db.query(`SELECT seller_id FROM products WHERE id = $1 AND is_active = true`, [product_id]);
        return result.rows[0].seller_id;
    }
}

module.exports = Product;