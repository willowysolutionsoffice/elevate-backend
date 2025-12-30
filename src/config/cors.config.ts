import { CorsOptions } from "cors";
import { env } from "./env.config";

export const corsOptions: CorsOptions = {
  origin: env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
};