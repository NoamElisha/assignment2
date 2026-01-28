import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";
import {User} from "../models/User";

const TEST_MONGO_URI = "mongodb://localhost:27017/test_auth";

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
  await User.deleteMany();

});

beforeEach(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  await User.deleteMany();
  await mongoose.disconnect();
});

describe("AUTH", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("POST /auth/register should create user and return tokens", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "noam",
      email: "noam@test.com",
      password: "123456",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it("POST /auth/register fails with missing fields", async () => {
    const res = await request(app).post("/auth/register").send({ username: "a" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing fields/i);
  });

  it("POST /auth/register fails with duplicate email/username", async () => {
    await request(app).post("/auth/register").send({
      username: "noam",
      email: "noam@test.com",
      password: "123456",
    });
    const res = await request(app).post("/auth/register").send({
      username: "noam",
      email: "noam@test.com",
      password: "123456",
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("POST /auth/login should return tokens", async () => {
    await request(app).post("/auth/register").send({
      username: "noam",
      email: "noam@test.com",
      password: "123456",
    });

    const res = await request(app).post("/auth/login").send({
      email: "noam@test.com",
      password: "123456",
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it("POST /auth/login fails with wrong password", async () => {
    await request(app).post("/auth/register").send({
      username: "noam",
      email: "noam@test.com",
      password: "123456",
    });
    const res = await request(app).post("/auth/login").send({
      email: "noam@test.com",
      password: "wrongpass",
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("POST /auth/login fails with missing fields", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing fields/i);
  });

  it("POST /auth/refresh should return new accessToken", async () => {
    await request(app).post("/auth/register").send({
      username: "noam",
      email: "noam@test.com",
      password: "123456",
    });

    const login = await request(app).post("/auth/login").send({
      email: "noam@test.com",
      password: "123456",
    });

    const refreshToken = login.body.refreshToken;

    const res = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("POST /auth/refresh fails with invalid token", async () => {
    const res = await request(app).post("/auth/refresh").send({ refreshToken: "badtoken" });
    expect([400, 401, 500]).toContain(res.status);
  });

  it("POST /auth/logout should invalidate refresh token", async () => {
    await request(app).post("/auth/register").send({
      username: "noam",
      email: "noam@test.com",
      password: "123456",
    });

    const login = await request(app).post("/auth/login").send({
      email: "noam@test.com",
      password: "123456",
    });

    const refreshToken = login.body.refreshToken;

    const out = await request(app).post("/auth/logout").send({ refreshToken });
    expect(out.status).toBe(200);

    const refreshAgain = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(refreshAgain.status).toBe(401);
  });

  it("POST /auth/logout with invalid token returns ok", async () => {
    const res = await request(app).post("/auth/logout").send({ refreshToken: "badtoken" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
