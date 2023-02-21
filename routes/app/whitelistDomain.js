const express = require("express");
const whitelistDomain = express.Router();
const User = require("../../models/Users");
const UserSkipedDomains = require("../../models/UserSkipedDomains");
// validation
const Joi = require("@hapi/joi");

const schema = Joi.object({
  uid: Joi.string().max(1024).required(),
  url: Joi.string().required(),
});

whitelistDomain.post("/", async (req, res) => {
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

  // add link to skiped domain doc
  const skiped = new UserSkipedDomains({
    uid,
    domains: url,
  });

  try {
    // save user
    await skiped.save();

    res.status(200).json({
      message: "domain Added successfully",
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

module.exports = whitelistDomain;
