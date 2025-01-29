const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");
const User = require("../models/users");
const Session = require("../models/sessions");
const db = require("../config/db");
require("dotenv").config();

process.env.NODE_ENV = "test";

// Mock data for testing
const testUser = {
    user_name: "testuser",
    password: "password",
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
};

let testUserId;
let testToken;

describe("Auth Routes", () => {

    beforeEach(async () => {
        // Clear existing users and sessions before each test
        await db.query("DELETE FROM sessions");
        await db.query("DELETE FROM users");

        // Create a test user before each test
        const user = await User.register(testUser);
        const result = await db.query(
            `SELECT id FROM users WHERE user_name = $1`,
            [testUser.user_name]
        );
        testUserId = result.rows[0].id;
        testToken = jwt.sign(
            { user_name: testUser.user_name, user_id: testUserId },
            SECRET_KEY
        );
    });

    afterAll(async () => {
        // Close the database connection
        await db.end();
    });

    describe("POST /auth/login", () => {
        it("should log in a user and return a token", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ user_name: testUser.user_name, password: testUser.password });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("token");

            // Verify the token
            const decoded = jwt.verify(res.body.token, SECRET_KEY);
            expect(decoded.user_name).toBe(testUser.user_name);
            expect(decoded.user_id).toBe(testUserId);

            // Verify session creation
            const session = await Session.verify({ user_id: testUserId });
            expect(session).toBeTruthy();
        });

        it("should return 400 for invalid credentials", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ user_name: testUser.user_name, password: "wrongpassword" });

            expect(res.statusCode).toBe(400);
            expect(res.body.error.message).toBe("Invalid username/password");
        });

        it("should return 400 for missing credentials", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ user_name: testUser.user_name });

            expect(res.statusCode).toBe(400);
        });
    });

    describe("POST /auth/register", () => {
        it("should register a new user", async () => {
            const newUser = {
                user_name: "newuser",
                password: "password",
                first_name: "New",
                last_name: "User",
                email: "new@example.com",
            };

            const res = await request(app).post("/auth/register").send(newUser);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe(
                "newuser has registered; you can now login."
            );

            // Verify user creation
            const result = await db.query(
                `SELECT * FROM users WHERE user_name = $1`,
                [newUser.user_name]
            );
            const user = result.rows[0];
            expect(user).toBeTruthy();
            expect(user.user_name).toBe(newUser.user_name);
        });

        it("should return an error for duplicate username", async () => {
            const res = await request(app).post("/auth/register").send(testUser);
            expect(res.statusCode).toBe(400); // Expecting a 400 error due to database constraint violation
        });

        it("should return 400 for missing fields", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({ user_name: "incomplete" });

            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /auth/logout", () => {

        it("should return 401 for unauthenticated user", async () => {
            const res = await request(app).get("/auth/logout");

            expect(res.statusCode).toBe(401);
            expect(res.body.error.message).toBe("Unauthorized");
        });

        it("should return 401 for invalid token", async () => {
            const res = await request(app)
                .get("/auth/logout")
                .set("Authorization", `Bearer invalidtoken`);

            expect(res.statusCode).toBe(401);
        });
    });
});