import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app";

const TEST_MONGO_URI = "mongodb://127.0.0.1:27017/assignment2_test";

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("AUTH", () => {
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
});
