import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { corsOptions } from "./config/cors.config";
import { rateLimiter } from "./middlewares/rate-limit.middlware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error-handler.middleware";
import testDBRoutes from "./routes/testdb.route";
import authRoute from "./routes/auth.route";
import branchRoute from "./routes/branch.route";

import roleRoute from "./routes/role.route";
import permissionRoute from "./routes/permission.route";
import rolePermissionRoute from "./routes/role-permission.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(rateLimiter);



app.use("/api/testdb", testDBRoutes);
app.use("/api/auth", authRoute);
app.use("/api/branch", branchRoute);

app.use("/api/role", roleRoute);
app.use("/api/permission", permissionRoute);
app.use("/api/role-permission", rolePermissionRoute);


app.get("/api/ping", (_req, res) => {
  res.json({ status: "ok" });
});


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
