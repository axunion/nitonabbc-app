import { Hono } from "hono";
import { authRoute } from "./routes/auth.ts";
import { healthRoute } from "./routes/health.ts";
import { inviteRoute } from "./routes/invite.ts";
import type { AppEnv } from "./types.ts";

const app = new Hono<AppEnv>().basePath("/api");

app.route("/health", healthRoute);
app.route("/auth", authRoute);
app.route("/invite", inviteRoute);

export default app;
