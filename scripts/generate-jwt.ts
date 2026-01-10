import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error("Error: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

const token = jwt.sign({}, secret);

