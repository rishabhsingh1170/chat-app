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
    isSelectedUserTyping: false,
    chatMessageHandler: null,
    sidebarMessageHandler: null,
    typingHandler: null,

    moveUserToTop: (userId) => {
        const { users } = get();
        const user = users.find((item) => item._id === userId);
        if (!user) return;

        set({
            users: [
                { ...user, lastMessageAt: new Date().toISOString() },
                ...users.filter((item) => item._id !== userId),
            ],
        });
    },

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
        const {selectedUser , messages, moveUserToTop} = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages:[...messages , res.data]})
            moveUserToTop(selectedUser._id);
        } catch (error) {
            toast.error(error.response.data);
        }
    },

    subscribeToMeaasages: () => {
      const { selectedUser } = get();
      if (!selectedUser) return;

      const socket = useAuthStore.getState().socket;
      if (!socket) return;

      const previousHandler = get().chatMessageHandler;
      if (previousHandler) socket.off("newMessage", previousHandler);
      const previousTypingHandler = get().typingHandler;
      if (previousTypingHandler) socket.off("typing", previousTypingHandler);

      const handler = (newMessage) => {
        get().moveUserToTop(newMessage.senderId);

        if(newMessage.senderId !== selectedUser._id) return;
        set({
          messages: [...get().messages, newMessage],
        });
      };
      const typingHandler = ({ senderId, isTyping }) => {
        if (senderId !== selectedUser._id) return;
        set({ isSelectedUserTyping: isTyping });
      };

      socket.on("newMessage", handler);
      socket.on("typing", typingHandler);
      set({ chatMessageHandler: handler, typingHandler });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        const handler = get().chatMessageHandler;
        const typingHandler = get().typingHandler;

        if (socket && handler) socket.off("newMessage", handler);
        if (socket && typingHandler) socket.off("typing", typingHandler);
        set({ chatMessageHandler: null, typingHandler: null, isSelectedUserTyping: false });
    },

    sendTypingStatus: (isTyping, receiverId) => {
        const { selectedUser } = get();
        const socket = useAuthStore.getState().socket;
        const typingReceiverId = receiverId || selectedUser?._id;

        if (!socket || !typingReceiverId) return;

        socket.emit("typing", {
            receiverId: typingReceiverId,
            isTyping,
        });
    },

    subscribeToSidebarMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        const previousHandler = get().sidebarMessageHandler;
        if (previousHandler) socket.off("newMessage", previousHandler);

        const handler = (newMessage) => {
            get().moveUserToTop(newMessage.senderId);
        };

        socket.on("newMessage", handler);
        set({ sidebarMessageHandler: handler });
    },

    unsubscribeFromSidebarMessages: () => {
        const socket = useAuthStore.getState().socket;
        const handler = get().sidebarMessageHandler;

        if (socket && handler) socket.off("newMessage", handler);
        set({ sidebarMessageHandler: null });
    },

    setSelectedUser: (selectedUser) => set({selectedUser}),
}))
