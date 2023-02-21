const mongoose = require("mongoose");

const UserSkipedUrls = new mongoose.Schema(
  {
    uid: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSkipedUrls", UserSkipedUrls);
