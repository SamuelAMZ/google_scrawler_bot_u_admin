const express = require("express");
const reportALeak = express.Router();
const User = require("../../models/Users");
const UserReportLeak = require("../../models/UserReportLeak");
// validation
const Joi = require("@hapi/joi");

const schema = Joi.object({
  uid: Joi.string().max(1024).required(),
  website: Joi.string().required(),
  date: Joi.string().required(),
  desc: Joi.string().required(),
});

reportALeak.post("/", async (req, res) => {
  const { uid, website, date, desc } = req.body;

  try {
    // joi validation sbody data
    const validation = await schema.validateAsync({
      uid,
      website,
      date,
      desc,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  // search user
  const checkUser = await User.findOne({ _id: uid });
  if (!checkUser) {
    res.status(400).json({ message: "user not found", code: "bad" });
    return;
  }

  // add link to skiped domain doc
  const report = new UserReportLeak({
    uid,
    website,
    date,
    desc,
    viewed: false,
  });

  try {
    // save user
    await report.save();

    res.status(200).json({
      message: "leak reported successfully",
      code: "ok",
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error.message,
    });
    return;
  }
});

module.exports = reportALeak;
