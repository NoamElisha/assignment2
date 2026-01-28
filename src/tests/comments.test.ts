import request from "supertest";
import { app } from "../app";
import comment from "../models/Comment";
import post from "../models/Post";
import { User } from "../models/User";
import mongoose from "mongoose";

jest.setTimeout(20000);
const TEST_MONGO_URI = "mongodb://localhost:27017/test_comments";

let testUserId: string;
let testPostId: string;

beforeAll(async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  await mongoose.connect(TEST_MONGO_URI);
  await comment.deleteMany();
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
  const postRes = await request(app).post("/post").send({
    content: "test post for comments",
    sender: testUserId
  });
  testPostId = postRes.body._id || postRes.body.id;
  commentsList = [
    { content: "this is my comment", postId: testPostId, sender: testUserId },
    { content: "this is my second comment", postId: testPostId, sender: testUserId },
    { content: "this is my third comment", postId: testPostId, sender: testUserId },
    { content: "this is my fourth comment", postId: testPostId, sender: testUserId },
  ];
  // Save comments and store their IDs
  for (let i = 0; i < commentsList.length; i++) {
    const response = await request(app).post("/comment").send(commentsList[i]);
    commentsList[i]._id = response.body._id || response.body.id;
  }
});

afterAll(async () => {
  await comment.deleteMany();
  await post.deleteMany();
  await User.deleteMany();
  await mongoose.disconnect();
});

type CommentData = { postId: string, content: string, sender: string, _id?: string };
let commentsList: CommentData[];


describe("Sample Test Suite", () => {

  beforeEach(async () => {
    await comment.deleteMany();
    await post.deleteMany();
    await User.deleteMany();
    // Create user and post for each test
    const user = new User({
      username: "testuser",
      email: "test@test.com",
      passwordHash: "123123123",
      refreshTokenHashes: []
    });
    const savedUser = await user.save();
    testUserId = savedUser._id.toString();
    const postRes = await request(app).post("/post").send({
      content: "test post for comments",
      sender: testUserId
    });
    testPostId = postRes.body._id || postRes.body.id;
    commentsList = [
      { content: "this is my comment", postId: testPostId, sender: testUserId },
      { content: "this is my second comment", postId: testPostId, sender: testUserId },
      { content: "this is my third comment", postId: testPostId, sender: testUserId },
      { content: "this is my fourth comment", postId: testPostId, sender: testUserId },
    ];
    // Save comments and store their IDs
    for (let i = 0; i < commentsList.length; i++) {
      const response = await request(app).post("/comment").send(commentsList[i]);
      commentsList[i]._id = response.body._id || response.body.id;
    }
  });

  test("Create Comment", async () => {
    // Already created in beforeEach, just check count and content
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(commentsList.length);
    for (let i = 0; i < commentsList.length; i++) {
      expect(response.body[i].content).toBe(commentsList[i].content);
      expect(response.body[i].postId).toBe(commentsList[i].postId);
      expect(response.body[i].sender).toBe(commentsList[i].sender);
    }
  });

  test("Get All Comments", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(commentsList.length);
  });

  test("Get Comments by postId", async () => {
    const response = await request(app).get(
      "/comment?postId=" + testPostId
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(commentsList.length);
    expect(response.body[0].content).toBe(commentsList[0].content);
  });

  test("Get Comment by ID", async () => {
    const response = await request(app).get("/comment/" + commentsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0].content);
    expect(response.body.postId).toBe(commentsList[0].postId);
    expect(response.body.sender).toBe(commentsList[0].sender);
    expect(response.body._id).toBe(commentsList[0]._id);
  });

  test("Get Comment by invalid ID returns 404", async () => {
    const response = await request(app).get("/comment/000000000000000000000000");
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
  });

  test("Update Comment", async () => {
    // Ensure we have a fresh comment to update
    const getResponse = await request(app).get("/comment");
    const commentToUpdate = getResponse.body[0];
    const updatedContent = "This is an updated comment";
    const response = await request(app)
      .put("/comment/" + commentToUpdate._id)
      .send({ content: updatedContent });
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(updatedContent);
    expect(response.body._id).toBe(commentToUpdate._id);
  });

  test("Update non-existent Comment returns 404", async () => {
    const response = await request(app)
      .put("/comment/000000000000000000000000")
      .send({ content: "should not work" });
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
  });

  test("Delete Comment", async () => {
    const response = await request(app).delete("/comment/" + commentsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Comment deleted successfully");

    const getResponse = await request(app).get("/comment/" + commentsList[0]._id);
    expect(getResponse.status).toBe(404);
  });

  test("Delete non-existent Comment returns 404", async () => {
    const response = await request(app).delete("/comment/000000000000000000000000");
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
  });

  test("Delete Comment twice returns 404 on second delete", async () => {
    const getResponse = await request(app).get("/comment");
    const commentToDelete = getResponse.body[0];
    const firstDelete = await request(app).delete("/comment/" + commentToDelete._id);
    expect(firstDelete.status).toBe(200);
    const secondDelete = await request(app).delete("/comment/" + commentToDelete._id);
    expect(secondDelete.status).toBe(404);
  });

  test("Create Comment with missing fields returns 500 or 400", async () => {
    const response = await request(app).post("/comment").send({});
    expect([400, 500]).toContain(response.status);
  });
});