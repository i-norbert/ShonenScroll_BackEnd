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
    const { senderId, receiverId, content, type } = req.body;

    const message = await Message.create({ senderId, receiverId, content, type});
    res.json(message);
});

// Get all chats for a user (with latest message + user info)
router.get("/chats/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
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

        const chatMap = new Map();

        for (const message of messages) {
            const isSender = message.senderId === userId;
            const otherUser = isSender ? message.Receiver : message.Sender;

            // Skip if the associated user wasn't found
            if (!otherUser) continue;

            if (!chatMap.has(otherUser.userid)) {
                let preview = message.content;

                if (message.type === "chapter") {
                    try {
                        const parsed = JSON.parse(message.content);
                        preview = `📘 ${parsed.title}`;
                    } catch (err) {
                        preview = "[Chapter]";
                    }
                }

                chatMap.set(otherUser.userid, {
                    user: otherUser,
                    lastMessage: {
                        type: message.type,
                        content: message.content,
                        preview,
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
