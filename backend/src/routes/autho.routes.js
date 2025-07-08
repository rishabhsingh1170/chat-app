import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    checkAuth,
  login,
  logout,
  singup,
  updateProfile,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", singup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check" , protectRoute , checkAuth)

export default router;
