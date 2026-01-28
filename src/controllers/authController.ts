import { Request, Response } from "express";
import { User } from "../models/User";
import { hashPassword, verifyPassword } from "../utils/password";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens";

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body as {
        username: string;
        email: string;
        password: string;
      };

      if (!username || !email || !password) {
        return res.status(400).json({ message: "missing fields" });
      }

      const exists = await User.findOne({ $or: [{ username }, { email }] });
      if (exists) return res.status(409).json({ message: "user already exists" });

      const user = await User.create({
        username,
        email,
        passwordHash: hashPassword(password),
        refreshTokenHashes: [],
      });

      const accessToken = signAccessToken(user._id.toString());
      const refreshToken = signRefreshToken(user._id.toString());

      user.refreshTokenHashes.push(hashToken(refreshToken));
      await user.save();

      return res.status(201).json({
        user: { id: user._id, username: user.username, email: user.email },
        accessToken,
        refreshToken,
      });
    } catch {
      return res.status(500).json({ message: "server error" });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as { email: string; password: string };
      if (!email || !password) return res.status(400).json({ message: "missing fields" });

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "invalid credentials" });

      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ message: "invalid credentials" });
      }

      const accessToken = signAccessToken(user._id.toString());
      const refreshToken = signRefreshToken(user._id.toString());

      user.refreshTokenHashes.push(hashToken(refreshToken));
      await user.save();

      return res.json({
        user: { id: user._id, username: user.username, email: user.email },
        accessToken,
        refreshToken,
      });
    } catch {
      return res.status(500).json({ message: "server error" });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      if (!refreshToken) return res.status(400).json({ message: "missing refreshToken" });

      // אם לא תקין - לא חושפים כלום, פשוט OK
      let userId: string;
      try {
        ({ userId } = verifyRefreshToken(refreshToken));
      } catch {
        return res.json({ ok: true });
      }

      const user = await User.findById(userId);
      if (!user) return res.json({ ok: true });

      const rtHash = hashToken(refreshToken);
      user.refreshTokenHashes = user.refreshTokenHashes.filter((h) => h !== rtHash);
      await user.save();

      return res.json({ ok: true });
    } catch {
      return res.json({ ok: true });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      if (!refreshToken) return res.status(400).json({ message: "missing refreshToken" });

      const { userId } = verifyRefreshToken(refreshToken);
      const user = await User.findById(userId);
      if (!user) return res.status(401).json({ message: "invalid refresh token" });

      const rtHash = hashToken(refreshToken);
      if (!user.refreshTokenHashes.includes(rtHash)) {
        return res.status(401).json({ message: "invalid refresh token" });
      }

      const accessToken = signAccessToken(user._id.toString());
      return res.json({ accessToken });
    } catch {
      return res.status(401).json({ message: "invalid refresh token" });
    }
  },
};
