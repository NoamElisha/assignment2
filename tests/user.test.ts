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

describe("USERS CRUD", () => {
  it("POST /users should create user", async () => {
    const res = await request(app).post("/users").send({
      username: "u1",
      email: "u1@test.com",
      password: "123456",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it("GET /users should return list", async () => {
    await request(app).post("/users").send({
      username: "u1",
      email: "u1@test.com",
      password: "123456",
    });

    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it("GET /users/:id should return user", async () => {
    const created = await request(app).post("/users").send({
      username: "u1",
      email: "u1@test.com",
      password: "123456",
    });

    const id = created.body.id;
    const res = await request(app).get(`/users/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("u1@test.com");
  });

  it("PUT /users/:id should update user", async () => {
    const created = await request(app).post("/users").send({
      username: "u1",
      email: "u1@test.com",
      password: "123456",
    });

    const id = created.body.id;
    const res = await request(app).put(`/users/${id}`).send({ username: "u2" });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("u2");
  });

  it("DELETE /users/:id should delete user", async () => {
    const created = await request(app).post("/users").send({
      username: "u1",
      email: "u1@test.com",
      password: "123456",
    });

    const id = created.body.id;
    const del = await request(app).delete(`/users/${id}`);
    expect(del.status).toBe(200);

    const res = await request(app).get(`/users/${id}`);
    expect(res.status).toBe(404);
  });
});
