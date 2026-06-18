import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isSendingOtp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isDeletingAccount: false,
  onlineUsers: [],
  socket: null,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("error in checkauth: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  requestSignupOtp: async (email) => {
    set({ isSendingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/send-signup-otp", { email });
      toast.success(res.data.message || "OTP sent to your email");
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not send OTP. Please try again."
      );
      return false;
    } finally {
      set({ isSendingOtp: false });
    }
  },

  signup: async (data) => {
    //console.log("data :" ,data);
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      console.log("res", res);
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Account created successfully");
        get().connectSocket();
      } else {
        // Handle cases where res or res.data is not available (e.g., non-200 status code without an error response body)
        toast.error("Signup failed. Invalid response from server.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message || "Profile update failed.");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  deleteAccount: async () => {
    set({ isDeletingAccount: true });
    try {
      const res = await axiosInstance.delete("/auth/me");
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [], socket: null });
      toast.success(res.data.message || "Account deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not delete account. Please try again."
      );
    } finally {
      set({ isDeletingAccount: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({onlineUsers:userIds});
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
