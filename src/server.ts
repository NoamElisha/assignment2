import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI in environment");
  }

  await mongoose.connect(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
