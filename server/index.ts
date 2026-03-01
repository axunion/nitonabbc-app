import { Hono } from "hono";
import { securityHeaders } from "./middleware/securityHeaders.ts";
import { adminRoute } from "./routes/admin.ts";
import { authRoute } from "./routes/auth.ts";
import { bulletinRoute } from "./routes/bulletin.ts";
import { bulletinTemplateRoute } from "./routes/bulletinTemplate.ts";
import { healthRoute } from "./routes/health.ts";
import { inviteRoute } from "./routes/invite.ts";
import type { AppEnv } from "./types.ts";

const app = new Hono<AppEnv>().basePath("/api");

app.use("*", securityHeaders);
app.route("/health", healthRoute);
app.route("/auth", authRoute);
app.route("/invite", inviteRoute);
app.route("/admin", adminRoute);
app.route("/bulletin", bulletinRoute);
app.route("/bulletin-template", bulletinTemplateRoute);

export default app;
