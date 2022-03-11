const jwt = require("jsonwebtoken");
const { destructUser } = require("../scripts/destructUser");
const Product = require("../models/Product");
const Chat = require("../models/Chat");

const verifyToken = (req, res, next) => {
  const headerToken = req.headers.authorization;

  if (headerToken) {
    jwt.verify(headerToken.split(" ")[1], process.env.JWT_SEC, (err, user) => {
      if (err) {
        return res.status(401).json("Token is not valid !");
      }

      req.user = destructUser(user);
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated !");
  }
};

const verifyUserByToken = async (req, res, next) => {
  try {
    const productId =
      req.body.productId || req.params.id || req.query.productId;
    const product = await Product.findById(productId);
    if (product._doc.userId === req.user.id) next();
    else
      res.status(403).send("You don't have permisions to do this action !!!");
  } catch (err) {
    res.status(500).json(err);
  }
};

const verifyUserToChatByToken = async (req, res, next) => {
  try {
    const productId =
      req.body.productId || req.params.id || req.query.productId;

    const chat = await Chat.find({
      productId: productId,
      userIds: { $elemMatch: { $eq: req.user.id } },
    });

    req.chat = chat;
    next();
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = { verifyToken, verifyUserByToken, verifyUserToChatByToken };
