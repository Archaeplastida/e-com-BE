require("dotenv").config();
process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const User = require('../models/users');
const Tag = require('../models/tags');
const db = require('../config/db');

describe('Product Routes', () => {

    const sellerUserData = {
        user_name: 'selleruser',
        password: 'password123',
        first_name: 'Seller',
        last_name: 'User',
        email: 'seller@example.com'
    };
    const regularUserData = {
        user_name: 'regularuser',
        password: 'password123',
        first_name: 'Regular',
        last_name: 'User',
        email: 'regular@example.com'
    };

    let sellerAuthToken;
    let regularAuthToken;
    let testProduct;
    let predefinedTagIds = {};

    const predefinedTags = ["Electronics", "Books", "Clothing"];

    afterAll(async () => {
        await db.query("DELETE FROM product_tag_map");
        await db.query("DELETE FROM product_image");
        await db.query("DELETE FROM sessions");
        await db.query("DELETE FROM review");
        await db.query("DELETE FROM products");
        await db.query("DELETE FROM users");
        await db.query("DELETE FROM tag");
        db.end();
    });

    beforeEach(async () => {
        try {
            await db.query("DELETE FROM product_tag_map");
            await db.query("DELETE FROM product_image");
            await db.query("DELETE FROM sessions");
            await db.query("DELETE FROM review");
            await db.query("DELETE FROM products");
            await db.query("DELETE FROM users");
            await db.query("DELETE FROM tag");


            await User.register(sellerUserData);
            const sellerLoginResponse = await request(app)
                .post('/auth/login')
                .send({ user_name: sellerUserData.user_name, password: sellerUserData.password });
            sellerAuthToken = sellerLoginResponse.body.token;

            await User.register(regularUserData);
            const regularLoginResponse = await request(app)
                .post('/auth/login')
                .send({ user_name: regularUserData.user_name, password: regularUserData.password });
            regularAuthToken = regularLoginResponse.body.token;

            for (const tagName of predefinedTags) {
                const tag = await Tag.create({ tag_name: tagName })
                predefinedTagIds[tagName] = tag.id;
            }

            const productPayload = {
                product_name: 'Test Product',
                product_description: 'Test description',
                price: 25.99,
                tags: [{ tag_id: predefinedTagIds["Electronics"] }],
                images: [{ image_url: 'http://example.com/image1.jpg' }]
            };
            const createProductResponse = await request(app)
                .post('/products/create')
                .set('Authorization', `Bearer ${sellerAuthToken}`)
                .send(productPayload);
            testProduct = createProductResponse.body.created;


        } catch (error) {
            console.error("Error during beforeEach setup:", error);
        }
    });

    const makeRequest = async (method, path, token, data, expectedStatus, expectedMessage) => {
        let req = request(app)[method](`/products${path}`);
        if (token) {
            req = req.set('Authorization', `Bearer ${token}`);
        }
        if (data) {
            req = req.send(data);
        }
        const response = await req;

        expect(response.statusCode).toBe(expectedStatus);

        if (expectedStatus >= 400) {
            expect(response.body.error).toBeDefined();
            if (expectedMessage) {
                expect(response.body.error.message).toContain(expectedMessage);
            }
        } else if (expectedStatus === 200 || expectedStatus === 201) {
            if (expectedMessage) {
                expect(response.body.message).toContain(expectedMessage);
            }
        }
        return response;
    };


    describe('POST /products/create', () => {
        it('should return 200 and created product for valid data by seller', async () => {
            const productPayload = {
                product_name: 'New Product',
                product_description: 'New description',
                price: 15.50,
                tags: [{ tag_id: predefinedTagIds["Books"] }],
                images: [{ image_url: 'http://example.com/image2.jpg' }]
            };

            const response = await makeRequest('post', '/create', sellerAuthToken, productPayload, 200);
            expect(response.body.created).toBeDefined();
            expect(response.body.created.product_name).toBe('New Product');
        });

        it('should return 400 for missing product_name', async () => {
            const productPayload = { product_description: 'Description', price: 10.00 };
            await makeRequest('post', '/create', sellerAuthToken, productPayload, 400, "Validation failed: requires property \"product_name\"");
        });

        it('should return 401 for unauthorized access (no token)', async () => {
            const productPayload = { product_name: 'Product', product_description: 'Description', price: 10.00 };
            await makeRequest('post', '/create', null, productPayload, 401, "Unauthorized");
        });
    });

    describe('GET /products', () => {
        it('should return 200 and a list of products for logged in user', async () => {
            const response = await makeRequest('get', '/', regularAuthToken, null, 200);
            expect(response.body.results).toBeDefined();
            expect(response.body.results.length).toBeGreaterThanOrEqual(1);
        });

        it('should return 401 for unauthorized access (no token)', async () => {
            await makeRequest('get', '/', null, null, 401, "Unauthorized");
        });
    });

    describe('GET /products/:product_id', () => {
        it('should return 200 and product details for valid product_id', async () => {
            const response = await makeRequest('get', `/${testProduct.id}`, regularAuthToken, null, 200);
            expect(response.body.product).toBeDefined();
            expect(response.body.product.id).toBe(testProduct.id);
        });

        it('should return 404 for non-existent product_id', async () => {
            await makeRequest('get', '/99999', regularAuthToken, null, 404, "Product not found");
        });

        it('should return 401 for unauthorized access (no token)', async () => {
            await makeRequest('get', `/${testProduct.id}`, null, null, 401, "Unauthorized");
        });
    });

    describe('PATCH /products/:product_id', () => {
        it('should return 200 and updated product for valid data and seller', async () => {
            const updatePayload = { product_name: 'Updated Product Name', price: 30.00 };
            const response = await makeRequest('patch', `/${testProduct.id}`, sellerAuthToken, updatePayload, 200);
            expect(response.body.product).toBeDefined();
            expect(response.body.product.product_name).toBe('Updated Product Name');
        });

        it('should return 404 if product not found', async () => {
            const updatePayload = { product_name: 'Updated Name' };
            await makeRequest('patch', '/99999', sellerAuthToken, updatePayload, 404, "Product not found");
        });

        it('should return 401 for unauthorized access (regular user)', async () => {
            const updatePayload = { product_name: 'Updated by Regular' };
            await makeRequest('patch', `/${testProduct.id}`, regularAuthToken, updatePayload, 401, "Unauthorized.");
        });

        it('should return 401 for unauthorized access (no token)', async () => {
            const updatePayload = { product_name: 'Updated without token' };
            await makeRequest('patch', `/${testProduct.id}`, null, updatePayload, 401, "Unauthorized");
        });
    });

    describe('DELETE /products/:product_id', () => {
        it('should return 200 and deletion message for valid product_id and seller', async () => {
            const response = await makeRequest('delete', `/${testProduct.id}`, sellerAuthToken, null, 200);
            expect(response.body.product_deleted).toBeDefined();
            expect(response.body.product_deleted.message).toBe("Product deleted.");
        });

        it('should return 404 if product not found', async () => {
            await makeRequest('delete', '/99999', sellerAuthToken, null, 404, "Product not found");
        });

        it('should return 401 for unauthorized access (regular user)', async () => {
            await makeRequest('delete', `/${testProduct.id}`, regularAuthToken, null, 401, "Unauthorized.");
        });

        it('should return 401 for unauthorized access (no token)', async () => {
            await makeRequest('delete', `/${testProduct.id}`, null, null, 401, "Unauthorized");
        });
    });

    describe('GET /products/tag/:tag_id', () => {
        it('should return 200 and products with the specified tag', async () => {
            const tagId = predefinedTagIds["Electronics"];
            const response = await makeRequest('get', `/tag/${tagId}`, regularAuthToken, null, 200);
            expect(response.body.products).toBeDefined();
            expect(response.body.products.length).toBeGreaterThanOrEqual(1);
        });

        it('should return 200 and empty array if no products with tag', async () => {
            const tagId = 999;
            const response = await makeRequest('get', `/tag/${tagId}`, regularAuthToken, null, 200);
            expect(response.body.products).toBeDefined();
            expect(response.body.products.length).toBe(0);
        });

        it('should return 401 for unauthorized access (no token)', async () => {
            const tagId = predefinedTagIds["Electronics"];
            await makeRequest('get', `/tag/${tagId}`, null, null, 401, "Unauthorized");
        });
    });

    describe('POST /products/:product_id/rate', () => {
        it('should return 200 and created review for valid rating', async () => {
            const ratePayload = { rating: 4, review_text: 'Good product' };
            const response = await makeRequest('post', `/${testProduct.id}/rate`, regularAuthToken, ratePayload, 200);
            expect(response.body.review).toBeDefined();
            expect(response.body.review.rating).toBe(4);
        });

        it('should return 400 for invalid rating (out of range)', async () => {
            const ratePayload = { rating: 6 };
            await makeRequest('post', `/${testProduct.id}/rate`, regularAuthToken, ratePayload, 400, "Validation failed: must be less than or equal to 5");
        });

        it('should return 400 for rating product twice by same user', async () => {
            const ratePayload = { rating: 5 };
            await makeRequest('post', `/${testProduct.id}/rate`, regularAuthToken, ratePayload, 200);
            await makeRequest('post', `/${testProduct.id}/rate`, regularAuthToken, ratePayload, 400, "ONE review per person");
        });

        it('should return 401 for unauthorized access (no token)', async () => {
            const ratePayload = { rating: 3 };
            await makeRequest('post', `/${testProduct.id}/rate`, null, ratePayload, 401, "Unauthorized");
        });
    });
});