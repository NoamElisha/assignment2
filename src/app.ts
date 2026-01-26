import express from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./swagger";
import { usersRouter } from "./routes/usersRoutes";
import { postsRouter } from "./routes/postsRoutes";
import { commentsRouter } from "./routes/commentsRoutes";
import { authRouter } from "./routes/authRoutes";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/users", usersRouter);
app.use("/post", postsRouter);
app.use("/comment", commentsRouter);
app.use("/auth", authRouter);
