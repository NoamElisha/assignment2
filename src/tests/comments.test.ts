import request from "supertest";
import { app } from "../app";
import commentsModel from "../models/Comment";
import Post from "../models/Post";
import { User } from "../models/User";
import { Express } from "express";
import mongoose from "mongoose";

const TEST_MONGO_URI = "mongodb://admin:admin@localhost:27017/";


let testUserId: string;
let testPostId: string;

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
  await commentsModel.deleteMany();
  await Post.deleteMany();
  await User.deleteMany();
  // Create a user
  const user = new User({
    username: "testuser",
    email: "test@test.com",
    passwordHash: "123123123",
    refreshTokenHashes: []
  });
  const savedUser = await user.save();
  testUserId = savedUser._id.toString();
  console.log("Created Test User ID:", testUserId);
  // Create a post
  const postRes = await request(app).post("/post").send({
    content: "test post for comments",
    sender: testUserId
  });
  testPostId = postRes.body._id || postRes.body.id;
  console.log("Created Test Post ID:", testPostId);
});

afterAll((done) => {
  mongoose.disconnect();
  done();
});

type CommentData = { postId: string, content: string, sender: string, _id?: string };
let commentsList: CommentData[];


describe("Sample Test Suite", () => {

  beforeAll(() => {
  commentsList = [
    { content: "this is my comment", postId: testPostId, sender: testUserId },
    { content: "this is my second comment", postId: testPostId, sender: testUserId },
    { content: "this is my third comment", postId: testPostId, sender: testUserId },
    { content: "this is my fourth comment", postId: testPostId, sender: testUserId },
    ];
  });


  test("Create Comment", async () => {
    for (const comment of commentsList) {
      const response = await request(app).post("/comment").send(comment);
      expect(response.status).toBe(201);
      expect(response.body.content).toBe(comment.content);
      expect(response.body.postId).toBe(comment.postId);
      expect(response.body.sender).toBe(comment.sender);
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
    commentsList[0]._id = response.body[0]._id;
  });

  test("Get Comment by ID", async () => {
    const response = await request(app).get("/comment/" + commentsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0].content);
    expect(response.body.postId).toBe(commentsList[0].postId);
    expect(response.body.sender).toBe(commentsList[0].sender);
    expect(response.body._id).toBe(commentsList[0]._id);
  });

  test("Update Comment", async () => {
    commentsList[0].content = "This is an updated comment";
    const response = await request(app)
      .put("/comment/" + commentsList[0]._id)
      .send({ content: commentsList[0].content });
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0].content);
    expect(response.body._id).toBe(commentsList[0]._id);
  });

  test("Delete Comment", async () => {
    const response = await request(app).delete("/comment/" + commentsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Comment deleted successfully");

    const getResponse = await request(app).get("/comment/" + commentsList[0]._id);
    expect(getResponse.status).toBe(404);
  });
});