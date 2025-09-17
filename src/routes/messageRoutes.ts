import * as express from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import Message from "../models/Message";
import User from "../models/User";

const router = express.Router();

// Get conversations list
router.get("/conversations", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;

    // Récupérer les conversations distinctes
    const conversations = await Message.aggregate([
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
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Get messages for a conversation
router.get(
  "/conversation/:otherUserId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!._id;
      const otherUserId = req.params.otherUserId;

      // Générer l'ID de conversation (toujours le même pour deux utilisateurs)
      const conversationId = [userId, otherUserId].sort().join("_");

      const messages = await Message.find({ conversationId })
        .populate("sender", "firstName lastName profilePicture")
        .populate("receiver", "firstName lastName profilePicture")
        .sort({ createdAt: 1 });

      // Marquer les messages comme lus
      await Message.updateMany(
        {
          conversationId,
          receiver: userId,
          isRead: false,
        },
        { isRead: true }
      );

      res.json({
        message: "Messages récupérés avec succès",
        messages,
      });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// Send message
router.post("/send", authenticate, async (req: AuthRequest, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "Destinataire et contenu requis" });
    }

    // Vérifier que le destinataire existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Destinataire non trouvé" });
    }

    const conversationId = [req.user!._id, receiverId].sort().join("_");

    const message = new Message({
      sender: req.user!._id,
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
  } catch (error: any) {
    console.error("Send message error:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'envoi du message" });
  }
});

// Mark messages as read
router.put("/read", authenticate, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.body;

    await Message.updateMany(
      {
        conversationId,
        receiver: req.user!._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ message: "Messages marqués comme lus" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
