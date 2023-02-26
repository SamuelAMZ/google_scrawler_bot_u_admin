const express = require("express");
const addNewUsername = express.Router();
const User = require("../../models/Users");
const Usernames = require("../../models/Usernames");
const Membership = require("../../models/Membership");
// validation
const Joi = require("@hapi/joi");

const schema = Joi.object({
  uid: Joi.string().max(1024).required(),
  username: Joi.string().required(),
});

addNewUsername.post("/", async (req, res) => {
  const { uid, username } = req.body;

  try {
    // joi validation sbody data
    const validation = await schema.validateAsync({
      uid,
      username,
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

  // search for the number of usernames the user already have
  const totalItems = await Usernames.find({
    uid: uid,
  });
  const totalItemsLength = totalItems.length;

  // check if user do not already have reached the limit of his membership
  const checkUserMembership = await Membership.findOne({ uid });
  if (!checkUserMembership) {
    res.status(400).json({ message: "membership not found", code: "bad" });
    return;
  }
  let maxUsername = 1;
  if (checkUserMembership.plan === "beginner") {
    maxUsername = 1;
  }
  if (checkUserMembership.plan === "basic") {
    maxUsername = 5;
  }
  if (checkUserMembership.plan === "pro") {
    maxUsername = 5;
  }

  if (totalItemsLength >= maxUsername) {
    return res.status(400).json({
      message: "have reached the max usernames of your plan",
      code: "bad",
    });
  }

  // create new username
  const skiped = new Usernames({
    uid,
    username,
  });

  try {
    // save user
    await skiped.save();

    res.status(200).json({
      message: "username added successfully",
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

module.exports = addNewUsername;
