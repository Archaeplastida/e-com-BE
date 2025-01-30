require("dotenv").config();
process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const User = require('../models/users');
const db = require('../config/db');

describe('Auth Routes - Schema Validation', () => {

    const testUserData = {
        user_name: 'testuser',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
    };
    const newTestUserData = {
        user_name: 'newtestuser',
        password: 'password123',
        first_name: 'NewTest',
        last_name: 'User',
        email: 'newtest@example.com'
    };

    beforeEach(async () => {
        try {
            await db.query("DELETE FROM sessions");
            await db.query("DELETE FROM users");
    
            
            try {
                await User.register(testUserData);
            } catch (registrationError) {
                if (registrationError.code !== '23505') {
                    throw registrationError;
                }
            }
        } catch (error) {
            console.error("Error during beforeEach setup:", error);
        }
    });

    const postRequest = async (path, data, expectedStatus, expectedMessage) => {
        const response = await request(app)
            .post(`/auth${path}`)
            .send(data);

        expect(response.statusCode).toBe(expectedStatus);

        if (expectedStatus >= 400) {
            expect(response.body.error).toBeDefined();
            if (expectedMessage) {
                expect(response.body.message).toContain(expectedMessage);
            }
        } else if (expectedStatus === 200 && expectedMessage) {
            expect(response.body.message).toContain(expectedMessage);
        }
        return response;
    };


    describe('POST /auth/login', () => {
        it('should return 200 and a token for valid login data', async () => {
            const response = await postRequest(
                '/login',
                { user_name: testUserData.user_name, password: testUserData.password },
                200
            );
            expect(response.body.token).toBeDefined();
        });

        it('should return 400 for missing username', async () => {
            await postRequest(
                '/login',
                { password: testUserData.password },
                400,
                "Validation failed: requires property \"user_name\""
            );
        });

        it('should return 400 for missing password', async () => {
            await postRequest(
                '/login',
                { user_name: testUserData.user_name },
                400,
                "Validation failed: requires property \"password\""
            );
        });

        it('should return 400 for extra field in request', async () => {
            await postRequest(
                '/login',
                { user_name: testUserData.user_name, password: testUserData.password, extra_field: 'somevalue' },
                400,
                "Validation failed: is not allowed to have the additional property \"extra_field\""
            );
        });
    });

    describe('POST /auth/register', () => {
        it('should return 200 and success message for valid registration data', async () => {
            const response = await postRequest(
                '/register',
                newTestUserData,
                200,
                `${newTestUserData.user_name} has registered`
            );
            expect(response.body.message).toContain(`${newTestUserData.user_name} has registered`);
        });

        it('should return 400 for missing username in registration', async () => {
            await postRequest(
                '/register',
                { password: newTestUserData.password, first_name: newTestUserData.first_name, last_name: newTestUserData.last_name, email: newTestUserData.email },
                400,
                "Validation failed: requires property \"user_name\""
            );
        });

        it('should return 400 for missing password in registration', async () => {
            await postRequest(
                '/register',
                { user_name: newTestUserData.user_name, first_name: newTestUserData.first_name, last_name: newTestUserData.last_name, email: newTestUserData.email },
                400,
                "Validation failed: requires property \"password\""
            );
        });

        it('should return 400 for missing first_name in registration', async () => {
            await postRequest(
                '/register',
                { user_name: newTestUserData.user_name, password: newTestUserData.password, last_name: newTestUserData.last_name, email: newTestUserData.email },
                400,
                "Validation failed: requires property \"first_name\""
            );
        });

        it('should return 400 for missing last_name in registration', async () => {
            await postRequest(
                '/register',
                { user_name: newTestUserData.user_name, password: newTestUserData.password, first_name: newTestUserData.first_name, email: newTestUserData.email },
                400,
                "Validation failed: requires property \"last_name\""
            );
        });

        it('should return 400 for missing email in registration', async () => {
            await postRequest(
                '/register',
                { user_name: newTestUserData.user_name, password: newTestUserData.password, first_name: newTestUserData.first_name, last_name: newTestUserData.last_name },
                400,
                "Validation failed: requires property \"email\""
            );
        });

        it('should return 400 for invalid email format in registration', async () => {
            await postRequest(
                '/register',
                { user_name: newTestUserData.user_name, password: newTestUserData.password, first_name: newTestUserData.first_name, last_name: newTestUserData.last_name, email: 'invalid-email' },
                400,
                "Validation failed: does not conform to the \"email\" format"
            );
        });

        it('should return 400 for extra field in registration', async () => {
            await postRequest(
                '/register',
                { ...newTestUserData, extra_field: 'somevalue' },
                400,
                "Validation failed: is not allowed to have the additional property \"extra_field\""
            );
        });

        it('should return 400 for username too short in registration', async () => {
            await postRequest(
                '/register',
                { ...newTestUserData, user_name: 'ab' },
                400,
                "Validation failed: does not meet minimum length of 3"
            );
        });

        it('should return 400 for password too short in registration', async () => {
            await postRequest(
                '/register',
                { ...newTestUserData, password: 'short' },
                400,
                "Validation failed: does not meet minimum length of 8"
            );
        });

        it('should return 400 for username with spaces in registration', async () => {
            await postRequest(
                '/register',
                { ...newTestUserData, user_name: 'user with space' },
                400,
                "Validation failed: does not match pattern \"^\\\\S*$\""
            );
        });
    });
});