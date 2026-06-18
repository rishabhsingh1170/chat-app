import cloudinary from "../lib/cloudinary.js";
import { sendOtpEmail } from "../lib/email.js";
import { generateToken } from "../lib/utils.js";
import Message from "../models/message.model.js";
import Otp from "../models/otp.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const OTP_EXPIRES_IN_MS = 10 * 60 * 1000;

const normalizeEmail = (email) => email.trim().toLowerCase();

export const sendSignupOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MS),
    });

    await sendOtpEmail(normalizedEmail, otp);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.log("error in send signup otp controller", error.message);
    res.status(500).json({ message: "Could not send OTP email" });
  }
};

export const singup = async (req, res) => {
  //res.send("signup route");
  const { fullName, email, password, otp } = req.body;
  try {
    if (!fullName || !email || !password || !otp) {
      return res.status(400).json({ message: "all feilds required" });
    }

    const normalizedEmail = normalizeEmail(email);

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be atleast 6 characters" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user) return res.status(400).json({ message: "email already exists" });

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    const isOtpCorrect = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isOtpCorrect) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    //const salt = bcrypt.genSalt(10);
    const hassedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password: hassedPassword,
    });

    if (newUser) {
      //generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();
      await Otp.deleteMany({ email: normalizedEmail });

      res.status(202).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("error in signup controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const login = async (req, res) => {
  //res.send("login route");

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("error in login controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  //res.send("logout route");
  try {
    res.cookie("jwt","", { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("error in logout controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile" , error);
    res.status(500).json({message:"internal error"});
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
    await User.findByIdAndDelete(userId);

    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("error in delete account controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req , res) => {
  try{
    res.status(200).json(req.user);
  }
  catch(error){
    console.log("error in checkAuth controller" , error.message);
    res.status(500).json({message:"Internal server error"});
  }
}
