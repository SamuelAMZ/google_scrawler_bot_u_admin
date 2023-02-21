const mongoose = require("mongoose");

const UserSkipedDomains = new mongoose.Schema(
  {
    uid: {
      type: String,
    },
    domains: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSkipedDomains", UserSkipedDomains);
