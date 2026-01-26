import { Request, Response } from "express";
import { User } from "../models/User";
import { hashPassword } from "../utils/password";

export const UsersController = {
  async create(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body as {
        username: string;
        email: string;
        password: string;
      };

      if (!username || !email || !password) return res.status(400).json({ message: "missing fields" });

      const exists = await User.findOne({ $or: [{ username }, { email }] });
      if (exists) return res.status(409).json({ message: "user already exists" });

      const user = await User.create({
        username,
        email,
        passwordHash: hashPassword(password),
        refreshTokenHashes: [],
      });

      return res.status(201).json({ id: user._id, username: user.username, email: user.email });
    } catch {
      return res.status(500).json({ message: "server error" });
    }
  },

  async getAll(_req: Request, res: Response) {
    const users = await User.find({}, { passwordHash: 0, refreshTokenHashes: 0 });
    return res.json(users);
  },

  async getById(req: Request, res: Response) {
    const user = await User.findById(req.params.id, { passwordHash: 0, refreshTokenHashes: 0 });
    if (!user) return res.status(404).json({ message: "not found" });
    return res.json(user);
  },

  async update(req: Request, res: Response) {
    const { username, email } = req.body as { username?: string; email?: string };

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(username ? { username } : {}), ...(email ? { email } : {}) } },
      { new: true, projection: { passwordHash: 0, refreshTokenHashes: 0 } }
    );

    if (!updated) return res.status(404).json({ message: "not found" });
    return res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "not found" });
    return res.json({ ok: true });
  },
};
