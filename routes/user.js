const router = require("express").Router();
const { verifyToken } = require("../controllers/verifyToken");
const { destructUser } = require("../scripts/destructUser");
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const params = req.query;
    const mongoQueryString = { _id: { $in: params._id } };
    const finalQueryParamFormat = Array.isArray(params?._id)
      ? mongoQueryString
      : { ...params };

    const allUsers = await User.find(finalQueryParamFormat);

    res
      .status(200)
      .json(
        allUsers.map((item) => item._doc).map((user) => destructUser(user))
      );
  } catch (err) {
    res.status(500).json(err);
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      res.status(200).json(destructUser(updatedUser._doc));
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id) {
    try {
      const removedUser = await User.deleteOne({ _id: req.user.id });

      res.status(200).json(removedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
