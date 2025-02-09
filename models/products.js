const db = require("../config/db");

class Product {
    static async create({ seller_id, product_name, product_description, price, tags, images }) {
        const result = await db.query(
            `INSERT INTO Products (seller_id, product_name, product_description, price, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, seller_id, product_name, product_description, price`,
            [seller_id, product_name, product_description, price]
        );

        const product_id = result.rows[0].id;

        if (images && images.length > 0) {
            await Promise.all(
                images.map(image => {
                    db.query(`INSERT INTO product_image (product_id, image_url, is_active) VALUES ($1, $2, true)`,
                        [product_id, image.image_url]
                    );
                })
            )
        }


        if (tags && tags.length > 0) {
            await Promise.all(
                tags.map((tag) =>
                    db.query(
                        `INSERT INTO product_tag_map (product_id, tag_id) VALUES ($1, $2)`,
                        [product_id, tag.tag_id]
                    )
                )
            );
            return {
                id: result.rows[0].id,
                seller_id: result.rows[0].seller_id,
                product_name: result.rows[0].product_name,
                product_description: result.rows[0].product_description,
                price: result.rows[0].price,
                tags,
            };
        }
        return {
            id : result.rows[0].id,
            seller_id: result.rows[0].seller_id,
            product_name: result.rows[0].product_name,
            product_description: result.rows[0].product_description,
            price: result.rows[0].price,
        };
    }

    static async getProductTags(product_id) {
        const result = await db.query(
            `SELECT t.id, t.tag_name
           FROM Tag t
           JOIN Product_tag_map ptm ON t.id = ptm.tag_id
           WHERE ptm.product_id = $1 AND t.is_active = true`,
            [product_id]
        );
        return result.rows;
    }

    static async getProductImages(product_id) {
        const result = await db.query(`SELECT image_url FROM product_image WHERE product_id = $1 AND is_active = true`,
            [product_id]
        );
        return result.rows;
    }

    static async getProductReviews(product_id) {
        const result = await db.query(
            `SELECT r.rating, r.review_text, r.created_at, u.user_name, u.id as user_id
            FROM review r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1 AND r.is_active = true`,
            [product_id]
        );
        return result.rows;
    }

    static async update({ product_id, product_name, product_description, price, tags }) {
        const result = await db.query(
            `UPDATE Products SET product_name = $1, product_description = $2, price = $3 WHERE id = $4 AND is_active = true RETURNING id, product_name, product_description, price`,
            [product_name, product_description, price, product_id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        if (tags) {
            await db.query(`DELETE FROM product_tag_map WHERE product_id = $1`, [
                product_id,
            ]);

            if (tags.length > 0) {
                await Promise.all(
                    tags.map((tag) =>
                        db.query(
                            `INSERT INTO product_tag_map (product_id, tag_id) VALUES ($1, $2)`,
                            [product_id, tag.tag_id]
                        )
                    )
                );
            }
        }

        const updatedProduct = result.rows[0];
        updatedProduct.tags = await Product.getProductTags(product_id);
        return updatedProduct;
    }

    static async delete({ product_id }) {
        await db.query(
            `UPDATE products SET is_active = false WHERE id = $1`,
            [product_id]
        );

        await db.query(`DELETE FROM product_tag_map WHERE product_id = $1`, [
            product_id,
        ]);

        return { message: "Product deleted." };
    }

    static async all() {
        const result = await db.query(
            `SELECT u.user_name, p.id, p.product_name, p.product_description, p.price 
           FROM users u 
           JOIN products p ON u.id = p.seller_id 
           WHERE p.is_active = true AND u.is_active = true`
        );

        const productsWithTags = await Promise.all(
            result.rows.map(async (product) => {
                product.tags = await Product.getProductTags(product.id);
                product.images = await Product.getProductImages(product.id);
                return product;
            })
        );

        return productsWithTags;
    }

    static async byId({ product_id }) {
        const result = await db.query(
            `SELECT u.user_name, p.id, p.product_name, p.product_description, p.price, p.created_at
           FROM users u 
           JOIN products p ON u.id = p.seller_id 
           WHERE p.id = $1 AND p.is_active = true AND u.is_active = true`,
            [product_id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const product = result.rows[0];
        product.tags = await Product.getProductTags(product_id);
        product.ratings = await Product.getProductReviews(product_id);
        product.images = await Product.getProductImages(product_id);
        return product;
    }

    static async getSellerId({ product_id }) {
        const result = await db.query(
            `SELECT seller_id FROM products WHERE id = $1 AND is_active = true`,
            [product_id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].seller_id;
    }

    static async byTagId({ tag_id }) {
        const result = await db.query(
            `SELECT p.id, p.product_name, p.product_description, p.price, p.created_at, u.user_name AS seller_name
           FROM Products p
           JOIN Product_tag_map ptm ON p.id = ptm.product_id
           JOIN Tag t ON ptm.tag_id = t.id
           JOIN Users u ON p.seller_id = u.id
           WHERE t.id = $1 AND p.is_active = true AND t.is_active = true AND u.is_active = true`,
            [tag_id]
        );

        const productsWithTags = await Promise.all(
            result.rows.map(async (product) => {
                product.tags = await Product.getProductTags(product.id);
                product.images = await Product.getProductImages(product.id);
                return product;
            })
        );

        return productsWithTags;
    }
}

module.exports = Product;