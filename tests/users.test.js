require("dotenv").config();
process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const User = require('../models/users');
const Cart = require('../models/carts');
const Product = require('../models/products');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/config');

describe('User Routes Tests', () => {

    const testUserData = {
        user_name: 'testuser',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
    };
    let authToken;
    let testUserId;


    beforeAll(async () => {
        try {
            await request(app)
                .post('/auth/register')
                .send(testUserData);

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({ user_name: testUserData.user_name, password: testUserData.password });

            authToken = loginResponse.body.token;
            const user = await User.authenticate({ user_name: testUserData.user_name, password: testUserData.password });
            testUserId = user;
        } catch (error) {
            console.error("Error during beforeAll setup:", error);
        }
    });


    afterAll(async () => {
        await db.query("DELETE FROM sessions");
        await db.query("DELETE FROM cart");
        await db.query("DELETE FROM products");
        await db.query("DELETE FROM product_image");
        await db.query("DELETE FROM product_tag_map");
        await db.query("DELETE FROM users");
        db.end();
    });

    beforeEach(async () => {
        await db.query("DELETE FROM cart");
        await db.query("DELETE FROM products");
        await db.query("DELETE FROM product_image");
        await db.query("DELETE FROM product_tag_map");
    });


    describe('GET /users/', () => {
        it('should return 401 if not logged in', async () => {
            const response = await request(app)
                .get('/users/');
            expect(response.statusCode).toBe(401);
        });

        it('should return 200 and user data if logged in', async () => {
            const response = await request(app)
                .get('/users/')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.user_name).toBe(testUserData.user_name);
            expect(response.body.user.email).toBe(testUserData.email);
        });

        it('should return 401 if user not found (even if token is valid - though unlikely in this route)', async () => {
            const invalidUserId = 99999;
            const invalidAuthTokenPayload = { user_id: invalidUserId, user_name: 'nonexistentuser' };
            const invalidAuthToken = jwt.sign(invalidAuthTokenPayload, SECRET_KEY);


            const response = await request(app)
                .get('/users/')
                .set('Authorization', `Bearer ${invalidAuthToken}`);

            expect(response.statusCode).toBe(401);
        });
    });

    describe('GET /users/cart', () => {
        it('should return 401 if not logged in', async () => {
            const response = await request(app)
                .get('/users/cart');
            expect(response.statusCode).toBe(401);
        });

        it('should return 200 and empty cart if no items in cart', async () => {
            const response = await request(app)
                .get('/users/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.result).toEqual([]);
        });

        it('should return 200 and cart items if items are in cart', async () => {
            const testProduct1 = { seller_id: testUserId, product_name: 'Test Product 1', product_description: 'Description 1', price: 10.00 };
            const testProduct2 = { seller_id: testUserId, product_name: 'Test Product 2', product_description: 'Description 2', price: 20.00 };

            const product1 = await Product.create(testProduct1);
            const product2 = await Product.create(testProduct2);


            await Cart.add_item({ user_id: testUserId, product_id: product1.id });
            await Cart.add_item({ user_id: testUserId, product_id: product2.id });


            const response = await request(app)
                .get('/users/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.result).toBeDefined();
            expect(response.body.result.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('POST /users/cart', () => {
        it('should return 401 if not logged in', async () => {
            const response = await request(app)
                .post('/users/cart')
                .send({ product_id: 1 });
            expect(response.statusCode).toBe(401);
        });

        it('should return 400 if product_id is missing', async () => {
            const response = await request(app)
                .post('/users/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.message).toContain("Validation failed: requires property \"product_id\"");
        });

        it('should return 400 if product_id is not an integer', async () => {
            const response = await request(app)
                .post('/users/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: 'invalid' });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.message).toContain("Validation failed: is not of a type(s) integer");
        });


        it('should return 200 and added item info if valid request', async () => {
            const testProduct3 = { seller_id: testUserId, product_name: 'Test Product 3', product_description: 'Description 3', price: 15.00 };
            const product3 = await Product.create(testProduct3);

            const response = await request(app)
                .post('/users/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: product3.id });

            expect(response.statusCode).toBe(200);
            expect(response.body.added).toBeDefined();
            expect(response.body.added.product_id).toBe(product3.id);
            expect(response.body.added.user_id).toBe(testUserId);

            const cartItems = await Cart.get_items({ user_id: testUserId });
            expect(cartItems.some(item => item.product_name === 'Test Product 3')).toBe(true);
        });

        it('should return 404 if product not found', async () => {

            const nonExistentProductId = 999;

            const response = await request(app)
                .post('/users/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: nonExistentProductId });

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('DELETE /users/cart', () => {
        it('should return 401 if not logged in', async () => {
            const response = await request(app)
                .delete('/users/cart')
                .send({ product_id: 1 });
            expect(response.statusCode).toBe(401);
        });

        it('should return 400 if product_id is missing', async () => {
            const response = await request(app)
                .delete('/users/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.message).toContain("Validation failed: requires property \"product_id\"");
        });

        it('should return 400 if product_id is not an integer', async () => {
            const response = await request(app)
                .delete('/users/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: 'invalid' });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.message).toContain("Validation failed: is not of a type(s) integer");
        });

        it('should return 200 and success message if valid request and item deleted', async () => {
            const testProduct4 = { seller_id: testUserId, product_name: 'Test Product 4', product_description: 'Description 4', price: 25.00 };
            const product4 = await Product.create(testProduct4);
            await Cart.add_item({ user_id: testUserId, product_id: product4.id });

            const response = await request(app)
                .delete('/users/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: product4.id });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Deleted successfully.");

            const cartItems = await Cart.get_items({ user_id: testUserId });
            expect(cartItems.some(item => item.product_name === 'Test Product 4')).toBe(false);
        });

        it('should return 400 if product not in cart', async () => {
            const nonExistentProductInCartId = 998;

            const response = await request(app)
                .delete('/users/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: nonExistentProductInCartId });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.message).toContain("Failed to remove item from cart. Product might not be in cart.");
        });
    });
});