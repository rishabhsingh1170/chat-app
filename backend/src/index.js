import express from "express";
import authRoutes from "./routes/autho.routes.js";
import messageRoutes from "./routes/message.routes.js"
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import { app , server } from "./lib/socket.js";

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

//const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

//app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin:"http://localhost:5173",
  credentials: true,
}))

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

import util from "util";

app._router.stack.forEach((layer, i) => {
  if (layer.route) {
    const path = layer.route?.path || "<no path>";
    const method = Object.keys(layer.route.methods).join(", ");
    console.log(`🔍 ROUTE ${i}: [${method.toUpperCase()}] ${path}`);
  } else if (layer.name === "router" && layer.handle.stack) {
    layer.handle.stack.forEach((r, j) => {
      console.log(`📎 Sub-route ${i}.${j}: ${util.inspect(r.route?.path)}`);
    });
  } else if (layer.name && layer.name !== "<anonymous>") {
    console.log(`🔧 Middleware ${i}: ${layer.name}`);
  }
});

server.listen(PORT, () => {
  console.log(`server running on post ${PORT}`);
  connectDB();
});
