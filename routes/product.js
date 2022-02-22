const router = require("express").Router();
const {
  verifyToken,
  verifyUserByToken,
} = require("../controllers/verifyToken");
const Product = require("../models/Product");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const { unlink } = require("fs");

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
  });

  try {
    const savedProduct = await newProduct.save();

    res.status(200).json(savedProduct);
  } catch (err) {
    console.log(`[eSTUDY API - PRODUCT ROUTE]: ERROR: ${err}`);
    res.status(500).json(err);
  }
});

router.patch("/:id", verifyToken, verifyUserByToken, async (req, res) => {
  VerifyUserByToken(req?.user);

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedProduct._doc);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", verifyToken, verifyUserByToken, async (req, res) => {
  try {
    const removedProduct = await Product.findOneAndDelete(
      {
        _id: req.params.id,
      },
      (err, product) => {
        if (err) {
          throw err;
        } else {
          product.images.forEach((image) => {
            unlink(`./imgs/products/${image.split("/")[5]}`, (err) => {
              if (err) throw err;
            });
          });
        }
      }
    );

    res.status(200).json(removedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
