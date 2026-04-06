import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import recordRoutes from "./modules/records/record.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { errorHandler, notFound } from "./middleware/error.middleware";

const app = express();

app.use(cors({
  origin: ["http://localhost:5000", "http://localhost:5173"], // Allow standard React and Vite ports
  credentials: true, // Required if you plan to send cookies or authorization headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes); 
app.use("/api/dashboard", dashboardRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
