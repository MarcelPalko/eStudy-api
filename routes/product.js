const router = require("express").Router();
const {
  verifyToken,
  verifyUserByToken,
} = require("../controllers/verifyToken");
const Product = require("../models/Product");
const DBInformation = require("../models/DBInformation");
const User = require("../models/User");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const { unlink } = require("fs");
const { createNotification } = require("../scripts/notification");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imgs/products");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

const detectChange = async () => {
  const lastChange = await DBInformation.findOne();
  const DBInformationDocument = await DBInformation.findOneAndUpdate(
    lastChange._doc._id,
    {
      productsLastChange: new Date().toISOString(),
    }
  );
};

router.get("/", async (req, res) => {
  try {
    const params = req.query;
    const allProducts = await Product.find({ ...params });

    res.status(200).json(allProducts.map((item) => item._doc));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", verifyToken, upload.array("images", 4), async (req, res) => {
  const images = req.files.map(
    (image) => `http://localhost:3000/images/products/${image.filename}`
  );
  const newProduct = new Product({
    title: req.body.title,
    description: req.body.description,
    categories: req.body.categories,
    images: images,
    userId: req.body.userId,
    status: "ACTIVE",
  });

  try {
    const savedProduct = await newProduct.save();
    await detectChange();

    res.status(200).json(savedProduct);
  } catch (err) {
    console.log(`[eSTUDY API - PRODUCT ROUTE]: ERROR: ${err}`);
    res.status(500).json(err);
  }
});

router.patch("/:id", verifyToken, verifyUserByToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    detectChange();
    return res.status(200).json(updatedProduct._doc);
  } catch (err) {
    res.status(500).json(err);
  }
});

// TODO - PROJET FAVOURITE ARRAY
// NOTIFICATIONS
router.delete("/:id", verifyToken, verifyUserByToken, async (req, res) => {
  try {
    const usersWithProduct = await User.find({
      favouriteProducts: { $elemMatch: { _id: req.params.id } },
    });

    for (const user of usersWithProduct.map((product) => product._doc)) {
      let newNotifications = [...user.notifications];
      const filteredProducts = user.favouriteProducts.filter(
        (product) => product._id + "" === req.params.id
      );
      const restProducts = user.favouriteProducts.filter(
        (product) => product._id + "" !== req.params.id
      );

      for (const product of filteredProducts) {
        const newNotification = createNotification(product, "DELETE");

        newNotifications.push(newNotification);
      }

      const updatedUser = await User.findByIdAndUpdate(user._id.toString(), {
        $set: {
          favouriteProducts: restProducts,
          notifications: newNotifications,
        },
      });
    }

    const product = await Product.findById(req.params.id);
    product.images.forEach((image) => {
      unlink(`./imgs/products/${image.split("/")[5]}`, (err) => {});
    });

    product.deleteOne();
    detectChange();

    return res.status(200).send();
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/last-change", async (req, res) => {
  try {
    const DBInformationObject = await DBInformation.findOne();

    res.status(200).json(DBInformationObject._doc);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
