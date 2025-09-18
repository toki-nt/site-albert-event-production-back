"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const auth_1 = require("../middleware/auth");
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const router = express.Router();
// Get conversations list
router.get("/conversations", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        // Récupérer les conversations distinctes
        const conversations = await Message_1.default.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiver", userId] },
                                        { $eq: ["$isRead", false] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.sender",
                    foreignField: "_id",
                    as: "senderInfo",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.receiver",
                    foreignField: "_id",
                    as: "receiverInfo",
                },
            },
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    unreadCount: 1,
                    participants: {
                        $concatArrays: ["$senderInfo", "$receiverInfo"],
                    },
                },
            },
        ]);
        res.json({
            message: "Conversations récupérées avec succès",
            conversations,
        });
    }
    catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
// Get messages for a conversation
router.get("/conversation/:otherUserId", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const otherUserId = req.params.otherUserId;
        // Générer l'ID de conversation (toujours le même pour deux utilisateurs)
        const conversationId = [userId, otherUserId].sort().join("_");
        const messages = await Message_1.default.find({ conversationId })
            .populate("sender", "firstName lastName profilePicture")
            .populate("receiver", "firstName lastName profilePicture")
            .sort({ createdAt: 1 });
        // Marquer les messages comme lus
        await Message_1.default.updateMany({
            conversationId,
            receiver: userId,
            isRead: false,
        }, { isRead: true });
        res.json({
            message: "Messages récupérés avec succès",
            messages,
        });
    }
    catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
// Send message
router.post("/send", auth_1.authenticate, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        if (!receiverId || !content) {
            return res
                .status(400)
                .json({ message: "Destinataire et contenu requis" });
        }
        // Vérifier que le destinataire existe
        const receiver = await User_1.default.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Destinataire non trouvé" });
        }
        const conversationId = [req.user._id, receiverId].sort().join("_");
        const message = new Message_1.default({
            sender: req.user._id,
            receiver: receiverId,
            content,
            conversationId,
        });
        await message.save();
        await message.populate("sender", "firstName lastName profilePicture");
        await message.populate("receiver", "firstName lastName profilePicture");
        res.status(201).json({
            message: "Message envoyé avec succès",
            messageData: message,
        });
    }
    catch (error) {
        console.error("Send message error:", error);
        res
            .status(500)
            .json({ message: "Erreur serveur lors de l'envoi du message" });
    }
});
// Mark messages as read
router.put("/read", auth_1.authenticate, async (req, res) => {
    try {
        const { conversationId } = req.body;
        await Message_1.default.updateMany({
            conversationId,
            receiver: req.user._id,
            isRead: false,
        }, { isRead: true });
        res.json({ message: "Messages marqués comme lus" });
    }
    catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.default = router;
