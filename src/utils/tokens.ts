import jwt from "jsonwebtoken";
import crypto from "crypto";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function signAccessToken(userId: string): string {
  const secret = mustEnv("JWT_ACCESS_SECRET");
  return jwt.sign({ userId }, secret, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string): string {
  const secret = mustEnv("JWT_REFRESH_SECRET");
  const tokenId = crypto.randomBytes(16).toString("hex");
  return jwt.sign({ userId, tokenId }, secret, { expiresIn: "7d" });
}

export function verifyRefreshToken(token: string): { userId: string; tokenId: string } {
  const secret = mustEnv("JWT_REFRESH_SECRET");
  const payload = jwt.verify(token, secret) as any;
  return { userId: payload.userId, tokenId: payload.tokenId };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
