const mongoose = require("mongoose");

const UserReportLeak = new mongoose.Schema(
  {
    uid: {
      type: String,
    },
    website: {
      type: String,
    },
    date: {
      type: String,
    },
    desc: {
      type: String,
    },
    viewed: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserReportLeak", UserReportLeak);
