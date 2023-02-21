const mongoose = require("mongoose");

const Usernames = new mongoose.Schema(
  {
    uid: {
      type: String,
    },
    username: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usernames", Usernames);
