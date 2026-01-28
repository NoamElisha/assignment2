import { Router } from "express";
import { UsersController } from "../controllers/userController";

export const usersRouter = Router();

usersRouter.post("/", UsersController.create);
usersRouter.get("/", UsersController.getAll);
usersRouter.get("/:id", UsersController.getById);
usersRouter.put("/:id", UsersController.update);
usersRouter.delete("/:id", UsersController.remove);
