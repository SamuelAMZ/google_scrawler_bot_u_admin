const express = require("express");
const saveIdUpload = express.Router();
const User = require("../../models/Users");
// validation
const Joi = require("@hapi/joi");

const schema = Joi.object({
  uid: Joi.string().max(1024).required(),
  url: Joi.string().required(),
});

saveIdUpload.post("/", async (req, res) => {
  const { uid, url } = req.body;

  try {
    // joi validation sbody data
    const validation = await schema.validateAsync({
      uid,
      url,
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

  // update id url
  // update status to processing
  checkUser.verificationUrl = url;
  checkUser.legalStatus = "verifying...";

  try {
    // save user
    await checkUser.save();

    res.status(200).json({
      message: "Uploaded successfully",
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

module.exports = saveIdUpload;
