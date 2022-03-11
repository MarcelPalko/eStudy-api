const router = require("express").Router();
const {
  verifyToken,
  verifyUserByToken,
  verifyUserToChatByToken,
} = require("../controllers/verifyToken");

const { createNotification } = require("../scripts/notification");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Product = require("../models/Product");

router.get("/", verifyToken, verifyUserToChatByToken, async (req, res) => {
  try {
    const productId = req.query.productId || null;

    if (productId) {
      return res.status(200).json(req.chat);
    } else {
      return res.status(400).send("Bad Parameters !!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get(
  "/change",
  verifyToken,
  verifyUserToChatByToken,
  async (req, res) => {
    try {
      const chatId = req.query.id || null;

      if (chatId) {
        const chat = await Chat.find({ _id: chatId });

        return res.status(200).json(chat.map((item) => item._doc));
      } else {
        return res.status(400).send("Bad Parameters !!");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.post("/", verifyToken, async (req, res) => {
  const newChat = new Chat({
    userIds: req.body.userIds,
    productId: req.body.productId,
    messages: req.body.messages,
    changedDate: new Date().toISOString(),
  });

  try {
    const savedChat = await newChat.save();

    res.status(200).json(savedChat);
  } catch (err) {
    console.log(`[eSTUDY API - CHAT ROUTE]: ERROR: ${err}`);
    res.status(500).json(err);
  }
});

router.post(
  "/message",
  verifyToken,
  verifyUserToChatByToken,
  async (req, res) => {
    const newMessage = {
      text: req.body.text,
      createdAt: new Date().toISOString(),
      status: "CREATED",
      authorId: req.user.id,
    };

    try {
      const activeChat = await Chat.findById(req.body.chatId, {
        userIds: 1,
      });

      const updatedChat = await Chat.findByIdAndUpdate(
        req.body.chatId,
        {
          $push: { messages: newMessage },
          $set: { changedDate: new Date().toISOString() },
        },
        { new: true }
      );

      const recieverId = [...activeChat.userIds].filter(
        (userId) => userId !== req.user.id
      )[0];
      const product = await Product.findById(req.body.productId, {
        title: 1,
        _id: 1,
      });

      await User.findByIdAndUpdate(
        recieverId,
        { $push: { notifications: createNotification(product, "MESSAGE") } },
        { new: true }
      ).then(() => res.status(200).json(updatedChat._doc));
    } catch (err) {
      console.log(`[eSTUDY API - CHAT ROUTE]: ERROR: ${err}`);
      res.status(500).json(err);
    }
  }
);

router.patch("/:id", verifyToken, verifyUserToChatByToken, async (req, res) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedChat._doc);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", verifyToken, verifyUserByToken, async (req, res) => {
  try {
    const removedChat = await Chat.deleteOne({ _id: req.params.id });

    res.status(200).json(removedChat);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
