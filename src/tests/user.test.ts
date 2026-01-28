import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";
import { User } from "../models/User";

describe("User API", () => {
  const TEST_MONGO_URI = "mongodb://localhost:27017/test_users";
  let testUserId: string;
  let uniqueSuffix: string;
  let userData: any;

  beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);
    await User.deleteMany();
  });

  afterAll(async () => {
    await User.deleteMany();
    await mongoose.disconnect();
  });

  beforeEach(() => {
    uniqueSuffix = Date.now() + Math.random().toString();
    userData = {
      username: "testuser_" + uniqueSuffix,
      email: "test_" + uniqueSuffix + "@test.com",
      password: "123123123"
    };
  });

  test("Create User via API", async () => {
    const response = await request(app).post("/users").send(userData);
    expect(response.status).toBe(201);
    expect(response.body.username).toBe(userData.username);
    expect(response.body.email).toBe(userData.email);
    testUserId = response.body.id;
  });

  test("Get All Users", async () => {
    await request(app).post("/users").send(userData);
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((u: any) => u.username === userData.username)).toBe(true);
  });

  test("Get User by ID", async () => {
    const createRes = await request(app).post("/users").send(userData);
    const id = createRes.body.id;
    const response = await request(app).get("/users/" + id);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(userData.username);
    expect(response.body.email).toBe(userData.email);
  });

  test("Update User", async () => {
    const createRes = await request(app).post("/users").send(userData);
    const id = createRes.body.id;
    const newEmail = "updated_" + userData.email;
    const response = await request(app).put("/users/" + id).send({ email: newEmail });
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(newEmail);
  });

  test("Delete User", async () => {
    const createRes = await request(app).post("/users").send(userData);
    const id = createRes.body.id;
    const response = await request(app).delete("/users/" + id);
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    // Confirm user is deleted
    const getRes = await request(app).get("/users/" + id);
    expect(getRes.status).toBe(404);
  });

  test("Duplicate User Creation Fails", async () => {
    await request(app).post("/users").send(userData);
    const response = await request(app).post("/users").send(userData);
    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already exists/i);
  });

  test("Missing Fields Fails", async () => {
    const response = await request(app).post("/users").send({ username: "a" });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/missing fields/i);
  });
});
