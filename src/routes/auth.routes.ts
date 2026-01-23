import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/logout", AuthController.logout);
authRouter.post("/refresh", AuthController.refresh);
