import { Router } from "express";
import { postController } from "../controllers/postController";

export const postsRouter = Router();

postsRouter.post("/", postController.create);
postsRouter.get("/", postController.getAll);
postsRouter.get("/:id", postController.getById);
postsRouter.put("/:id", postController.update);
postsRouter.delete("/:id", postController.delete);
