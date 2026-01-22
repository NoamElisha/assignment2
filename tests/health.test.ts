import request from "supertest";
import { app } from "../src/app";

describe("GET /health", () => {
  it("should return ok:true", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
