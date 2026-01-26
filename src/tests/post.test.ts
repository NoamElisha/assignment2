
import request from "supertest";
import { app } from "../app";
import post from "../models/Post";
import { Express } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { userInfo } from "os";

let testUserId: string;

const TEST_MONGO_URI = "mongodb://admin:admin@localhost:27017/";

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
  await post.deleteMany();
  await User.deleteMany();
  const user = new User({
    username: "testuser",
    email: "test@test.com",
    passwordHash: "123123123",
    refreshTokenHashes: []
  });
  const savedUser = await user.save();
  testUserId = savedUser._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
});

type postData = { content: string, sender: string, _id?: string };
let postsList: postData[];

describe("Sample Test Suite", () => {

  beforeAll(() => {
    // Use the created user's id for all posts
    postsList = [
      { content: "this is my post", sender: testUserId },
      { content: "this is my second post", sender: testUserId },
      { content: "this is my third post", sender: testUserId },
      { content: "this is my fourth post", sender: testUserId },
    ];
  });

  test("Create Post", async () => {
    for (const post of postsList) {
      const response = await request(app).post("/post").send(post);
      expect(response.status).toBe(201);
      expect(response.body.content).toBe(post.content);
      expect(response.body.sender).toBe(post.sender);
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
    // The test previously expected only 1 post, but all posts have the same sender
    expect(response.body.length).toBe(postsList.length);
    // Optionally, check the first post
    expect(response.body[0].content).toBe(postsList[0].content);
    postsList[0]._id = response.body[0]._id;
  });

  test("Get Post by ID", async () => {
    const response = await request(app).get("/post/" + postsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(postsList[0].content);
    expect(response.body.sender).toBe(postsList[0].sender);
    expect(response.body._id).toBe(postsList[0]._id);
  });

  test("Update Post", async () => {
    postsList[0].content = "This is an updated post";
    postsList[0].sender = testUserId;
    const response = await request(app)
      .put("/post/" + postsList[0]._id)
      .send(postsList[0]);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(postsList[0].content);
    expect(response.body.sender).toBe(postsList[0].sender);
    expect(response.body._id).toBe(postsList[0]._id);
  });

  test("Delete Post", async () => {
    const response = await request(app).delete("/post/" + postsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Post deleted successfully");

    const getResponse = await request(app).get("/post/" + postsList[0]._id);
    expect(getResponse.status).toBe(404);
  });
});