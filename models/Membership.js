const mongoose = require("mongoose");

const membership = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      max: 255,
    },
    plan: {
      type: String,
      max: 255,
    },
    recuringType: {
      type: String,
      max: 255,
    },
    start: {
      type: String,
    },
    end: {
      type: String,
    },
    features: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membership", membership);
