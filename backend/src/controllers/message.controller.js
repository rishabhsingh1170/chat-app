import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUserForSidebar = async (req ,res) =>{
    try {
        const loggedInUser = req.user._id;
        const users = await User.find({_id:{$ne:loggedInUser}}).select("-password").lean();
        const latestMessages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: loggedInUser },
                        { receiverId: loggedInUser },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", loggedInUser] },
                            "$receiverId",
                            "$senderId",
                        ],
                    },
                    lastMessageAt: { $first: "$createdAt" },
                },
            },
        ]);

        const latestMessageMap = new Map(
            latestMessages.map((message) => [
                message._id.toString(),
                message.lastMessageAt,
            ])
        );

        const filteredUsers = users
            .map((user) => ({
                ...user,
                lastMessageAt: latestMessageMap.get(user._id.toString()) || null,
            }))
            .sort((a, b) => {
                const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
                const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
                return bTime - aTime;
            });

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("error in getUsersForSidebar controller:",error.message);
        res.status(500).json({message:"Internal server error"});
    }
};

export const getMassages = async (req, res) => {
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId , receiverId:userToChatId},
                {senderId:userToChatId , receiverId:myId}
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("error in getMassages controller:", error.message);
        req.status(500).json({ message: "Internal server error" });        
    }
};

export const sendMessage = async (req , res) => {
    try {
        const {text , image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            //upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
            console.log("image url:" ,imageUrl);
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });

        await newMessage.save();

        //todo: real time functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage" , newMessage );
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("error in sendMassages controller:", error.message);
        req.status(500).json({ message: "Internal server error" });  
    }
};
