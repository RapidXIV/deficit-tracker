import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { setupAuth, authRouter } from "./auth";
import { apiRouter } from "./routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);

const app = express();

// Trust Railway's reverse proxy so req.secure is true on HTTPS connections
// (required for secure: true session cookies to be set correctly)
app.set("trust proxy", 1);

// Parse JSON request bodies
app.use(express.json());

// Session middleware (must come before any route that reads req.session)
setupAuth(app);

// Auth routes: POST /api/auth/signup, /login, /logout  GET /api/auth/me
app.use("/api/auth", authRouter);

// Data routes: /api/settings, /api/logs
app.use("/api", apiRouter);

// In production, serve the Vite-built React app from dist/public
if (process.env.NODE_ENV === "production") {
  const publicDir = path.join(__dirname, "public");
  app.use(express.static(publicDir));
  // SPA fallback: any non-API URL returns index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
