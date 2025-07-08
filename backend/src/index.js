import express from "express";
import authRoutes from "./routes/autho.routes.js";
import messageRoutes from "./routes/message.routes.js"
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import { app , server } from "./lib/socket.js";

import path from "path";

dotenv.config();

const PORT = process.env.PORT || 3000;

const _dirname = path.resolve();

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

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname,"../frontend/dist")));

  app.get("*", (req,res) => {
    res.sendFile(path.join(_dirname, "../frontend", "dist", "index.html"));
  })
}

server.listen(PORT, () => {
  console.log(`server running on post ${PORT}`);
  connectDB();
});
