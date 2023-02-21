const mongoose = require("mongoose");

const hash = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      max: 255,
    },
    hash: {
      type: String,
      required: true,
      max: 255,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hash", hash);
