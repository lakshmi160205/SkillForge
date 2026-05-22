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
      const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5174"];
      const isLocalhost = typeof origin === "string" && /^http:\/\/localhost:\d+$/.test(origin);

      // Allow server-to-server calls (no Origin), configured origin, and local Vite ports.
      if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
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
    await connect(process.env.DB_URL);
    console.log("DB connection success");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`server started on port ${process.env.PORT || 5000}`);
    });
  } catch (err) {
    console.log("Err in DB connection", err);
  }
};

connectDB();