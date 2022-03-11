const mongoose = require("mongoose");

const DBInformationSchema = new mongoose.Schema({
  productsLastChange: { type: String, required: true },
});

module.exports = mongoose.model("DBInformation", DBInformationSchema);
