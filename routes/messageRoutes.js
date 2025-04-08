const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const Message = require("../models/Message");
const User = require("../models/User");
const Friendship = require("../models/Friendship");

// Get messages between two users
router.get("/conversation/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;

    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 },
            ],
        },
        order: [["timestamp", "ASC"]],
    });

    res.json(messages);
});

// Send a message
router.post("/", async (req, res) => {
    const { senderId, receiverId, content } = req.body;

    const message = await Message.create({ senderId, receiverId, content });
    res.json(message);
});

// Get all chats for a user (with latest message + user info)
router.get("/chats/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        // Get all unique userIds this user has messaged with
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            order: [["timestamp", "DESC"]],
            include: [
                { model: User, as: "Sender", attributes: ["userid", "username", "profilePicture"] },
                { model: User, as: "Receiver", attributes: ["userid", "username", "profilePicture"] }
            ]
        });

        // Map to latest message per unique user
        const chatMap = new Map();

        for (const message of messages) {
            const otherUser = message.senderId == userId ? message.Receiver : message.Sender;
            if (!chatMap.has(otherUser.userid)) {
                chatMap.set(otherUser.userid, {
                    user: otherUser,
                    lastMessage: {
                        content: message.content,
                        timestamp: message.timestamp
                    }
                });
            }
        }

        const chatList = Array.from(chatMap.values());

        res.json(chatList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load chats" });
    }
});
router.post("/start", async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
        const existingMessage = await Message.findOne({
            where: {
                [Op.or]: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });

        if (!existingMessage) {
            await Message.create({
                senderId,
                receiverId,
                content: "👋 Started a conversation!",
            });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to start or fetch chat" });
    }
});


module.exports = router;
