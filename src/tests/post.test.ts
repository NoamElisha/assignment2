import request from "supertest";
import { app } from "../app";
import post from "../models/Post";
import mongoose from "mongoose";
import { User } from "../models/User";

let testUserId: string;

const TEST_MONGO_URI = "mongodb://localhost:27017/test_posts";

beforeAll(async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  await mongoose.connect(TEST_MONGO_URI);
  await post.deleteMany();
  await User.deleteMany();
  // Use a unique username for each test run
  const uniqueSuffix = Date.now() + Math.random();
  const user = new User({
    username: "testuser_" + uniqueSuffix,
    email: "test_" + uniqueSuffix + "@test.com",
    passwordHash: "123123123",
    refreshTokenHashes: []
  });
  const savedUser = await user.save();
  testUserId = savedUser._id.toString();
});

afterAll(async () => {
  await post.deleteMany();
  await mongoose.disconnect();
});

type postData = { content: string, sender: string, _id?: string };
let postsList: postData[];

describe("Sample Test Suite", () => {
  beforeEach(async () => {
    await mongoose.connect(TEST_MONGO_URI);
    await post.deleteMany();
    await User.deleteMany();
    // Use a unique username for each test run
    const uniqueSuffix = Date.now() + Math.random();
    const user = new User({
      username: "testuser_" + uniqueSuffix,
      email: "test_" + uniqueSuffix + "@test.com",
      passwordHash: "123123123",
      refreshTokenHashes: []
    });
    const savedUser = await user.save();
    testUserId = savedUser._id.toString();
    // Create posts for each test
    postsList = [
      { content: "this is my post", sender: testUserId },
      { content: "this is my second post", sender: testUserId },
      { content: "this is my third post", sender: testUserId },
      { content: "this is my fourth post", sender: testUserId },
    ];
    // Save posts and store their IDs
    for (let i = 0; i < postsList.length; i++) {
      const response = await request(app).post("/post").send(postsList[i]);
      postsList[i]._id = response.body._id || response.body.id;
    }
  });

  test("Create Post", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
    for (let i = 0; i < postsList.length; i++) {
      expect(response.body[i].content).toBe(postsList[i].content);
      expect(response.body[i].sender).toBe(postsList[i].sender);
    }
  });

  test("Get All Posts", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
  });

  test("Get Posts by sender", async () => {
    const response = await request(app).get(
      "/post?sender=" + testUserId
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
    expect(response.body[0].content).toBe(postsList[0].content);
  });

  test("Get Post by ID", async () => {
    const response = await request(app).get("/post/" + postsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(postsList[0].content);
    expect(response.body.sender).toBe(postsList[0].sender);
    expect(response.body._id).toBe(postsList[0]._id);
  });

  test("Get Post by invalid ID returns 404", async () => {
    const response = await request(app).get("/post/000000000000000000000000");
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
  });

  test("Update Post", async () => {
    postsList[0].content = "This is an updated post";
    const response = await request(app)
      .put("/post/" + postsList[0]._id)
      .send(postsList[0]);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(postsList[0].content);
    expect(response.body.sender).toBe(postsList[0].sender);
    expect(response.body._id).toBe(postsList[0]._id);
  });

  test("Update non-existent Post returns 404", async () => {
    const response = await request(app)
      .put("/post/000000000000000000000000")
      .send({ content: "should not work" });
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
  });

  test("Delete Post", async () => {
    const response = await request(app).delete("/post/" + postsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Post deleted successfully");

    const getResponse = await request(app).get("/post/" + postsList[0]._id);
    expect(getResponse.status).toBe(404);
  });

  test("Delete non-existent Post returns 404", async () => {
    const response = await request(app).delete("/post/000000000000000000000000");
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
  });

  test("Create Post with missing fields returns 500 or 400", async () => {
    const response = await request(app).post("/post").send({});
    expect([400, 500]).toContain(response.status);
  });
});