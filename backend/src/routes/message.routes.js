import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMassages, getUserForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users" , protectRoute,getUserForSidebar);
router.get("/:id",protectRoute,getMassages);

router.post("/send/:id" , protectRoute , sendMessage)

export default router;