const router = require("express").Router();
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const { destructUser } = require("../scripts/destructUser");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: cryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
    class: req.body.class,
  });

  try {
    const savedUser = await newUser.save();
    const token = jwt.sign(
      {
        id: savedUser._doc._id,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    res.status(201).json({ ...destructUser(savedUser._doc), token });
  } catch (err) {
    console.log(`[eSTUDY API - USER ROUTE]: ERROR: ${err}`);
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .json("[eSTUDY API - USER ROUTE]: Wrong information !!");
    }

    const hashedPassword = cryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const decPassword = hashedPassword.toString(cryptoJS.enc.Utf8);

    if (decPassword !== req.body.password) {
      return res
        .status(401)
        .json("[eSTUDY API - USER ROUTE]: Wrong information !!");
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    return res.status(200).json({ ...destructUser(user._doc), token });
  } catch (err) {
    console.log(`[eSTUDY API - USER ROUTE]: ERROR: ${err}`);
    return res.status(500).json(err);
  }
});

module.exports = router;
