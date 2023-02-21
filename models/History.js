const mongoose = require("mongoose");

const history = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      max: 255,
    },
    status: {
      type: String,
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
      max: 255,
    },
    end: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", history);
