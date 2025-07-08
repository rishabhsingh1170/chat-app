import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({isUsersLoading:true});
        try {
            const res = await axiosInstance.get("/messages/users");
            set({users:res.data});
        } catch (error) {
            toast.error(error.response.data.messages || "can't get user");
        }finally{
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});
        } catch (error) {
            toast.error(error.response.messages);
        }finally{
            set({isMessagesLoading:false});
        }
    },

    sendMessages: async (messageData) =>{
        const {selectedUser , messages} = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages:[...messages , res.data]})
        } catch (error) {
            toast.error(error.response.data);
        }
    },

    subscribeToMeaasages: () => {
      const { selectedUser } = get();
      if (!selectedUser) return;

      const socket = useAuthStore.getState().socket;
      // Always remove any existing listener to avoid duplicates

      socket.off("newMessage");

      socket.on("newMessage", (newMessage) => {

        if(newMessage.senderId !== selectedUser._id) return;
        set({
          messages: [...get().messages, newMessage],
        });
      });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;

        socket.off("newMeaasge");
    },

    setSelectedUser: (selectedUser) => set({selectedUser}),
}))