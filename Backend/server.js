import exp from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connect } from "mongoose";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { studentRoute } from "./APIs/StudentAPI.js";
import { instructorRoute } from "./APIs/InstructorAPI.js";
import { adminRoute } from "./APIs/AdminAPI.js";
import { commonRouter } from "./APIs/commonapi.js";
import { videoRoute } from "./APIs/videoAPI.js";
import { paymentRoute } from "./APIs/paymentAPI.js";
import cartRoutes from "./APIs/CartAPI.js";

config();

const normalizeMongoUrl = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  let normalized = value.trim();

  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1).trim();
  }

  if (normalized.startsWith("'") && normalized.endsWith("'")) {
    normalized = normalized.slice(1, -1).trim();
  }

  if (normalized.startsWith("DB_URL=")) {
    normalized = normalized.slice("DB_URL=".length).trim();
  }

  return normalized;
};

const app = exp();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin: (origin, callback) => {
      const isProduction = process.env.NODE_ENV === "production";
      const defaultOrigins = isProduction
        ? ["https://skillforge-kappa-azure.vercel.app"]
        : ["http://localhost:5174"];
      const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || defaultOrigins.join(","))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Log allowed origins for debugging in deployed environments
      // (will only log to server console)
      console.log("Allowed CORS origins:", allowedOrigins);
      const isLocalhost = typeof origin === "string" && /^http:\/\/localhost:\d+$/.test(origin);
      const isVercelHost = typeof origin === "string" && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

      // Allow server-to-server calls (no Origin), configured origins, local Vite ports, and Vercel deploys.
      if (!origin || allowedOrigins.includes(origin) || isLocalhost || isVercelHost) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(exp.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", exp.static(uploadsDir));

app.use("/student-api", studentRoute);
app.use("/instructor-api", instructorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);
app.use("/video-api", videoRoute);
app.use("/payment-api", paymentRoute);
app.use("/student-api/cart", cartRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `${req.url} is an invalid path` });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  let message = err.message || "Unexpected error";
  let details;

  if (err.name === "ValidationError") {
    message = "Validation error";
    details = Object.values(err.errors || {}).map((error) => error.message);
  }

  if (err.name === "CastError") {
    message = "Invalid value for field";
    details = err.path ? [`${err.path} is invalid`] : undefined;
  }

  if (err.code === 11000) {
    message = "Duplicate value";
    const fields = Object.keys(err.keyValue || {});
    details = fields.map((field) => `${field} already exists`);
  }

  const response = { message, status };

  if (details?.length) {
    response.details = details;
  }

  if (!isProduction) {
    response.stack = err.stack;
  }

  console.log("err :", err);
  res.status(status).json(response);
});

const connectDB = async () => {
  try {
    const dbUrl = normalizeMongoUrl(
      process.env.DB_URL || process.env.MONGO_URI || process.env.MONGODB_URI
    );

    if (!dbUrl) {
      throw new Error("DB connection string is missing");
    }

    await connect(dbUrl);
    console.log("DB connection success");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`server started on port ${process.env.PORT || 5000}`);
    });
  } catch (err) {
    console.log("Err in DB connection", err);
  }
};

connectDB();