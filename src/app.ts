import express from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./swagger";
import { usersRouter } from "./routes/users.routes";
import { postsRouter } from "./routes/posts.routes";
import { commentsRouter } from "./routes/comments.routes";
import { authRouter } from "./routes/auth.routes";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/users", usersRouter);
app.use("/post", postsRouter);
app.use("/comments", commentsRouter);
app.use("/auth", authRouter);
