const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({}, {
  strict: false
});

module.exports = mongoose.model("Delivery", deliverySchema, "deliveries");