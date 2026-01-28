import { Router } from "express";
import { commentController } from "../controllers/commentController";

export const commentsRouter = Router();

commentsRouter.post("/", commentController.create);
commentsRouter.get("/", commentController.getAll);
commentsRouter.get("/:id", commentController.getById);
commentsRouter.put("/:id", commentController.update);
commentsRouter.delete("/:id", commentController.remove);