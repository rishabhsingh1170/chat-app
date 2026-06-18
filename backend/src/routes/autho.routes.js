import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    checkAuth,
  deleteAccount,
  login,
  logout,
  sendSignupOtp,
  singup,
  updateProfile,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", singup);
router.post("/send-signup-otp", sendSignupOtp);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.delete("/me", protectRoute, deleteAccount);

router.get("/check" , protectRoute , checkAuth)

export default router;
