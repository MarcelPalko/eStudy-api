const express = require("express");
const app = express();
const http = require("http");
const server = http.Server(app);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

/** ROUTES */
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const chatRoute = require("./routes/chat");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("[eSTUDY API]: Successfully connected to DB !"))
  .catch((err) => console.log(`[eSTUDY API]: ERROR: ${err}`));

app.use("/images", express.static(path.join(__dirname, "imgs")));
app.use(express.json({ limit: "50mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

app.options("/*", (_, res) => {
  res.sendStatus(200);
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/chats", chatRoute);

server.listen(process.env.PORT, () => {
  console.log("[eSTUDY API]: App started !");
});
