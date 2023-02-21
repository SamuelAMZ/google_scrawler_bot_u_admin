const express = require("express");
const changePassRoute = express.Router();
const User = require("../../../models/Users");
const Hash = require("../../../models/Hash");

// validation
const Joi = require("@hapi/joi");
// hashing pass
const bcrypt = require("bcrypt");
// jwt
const { createToken } = require("./../jwt");

const schema = Joi.object({
  uid: Joi.string().max(1024).required(),
  uHash: Joi.string().max(1024).required(),
  password: Joi.string().min(6).max(1024).required(),
});

changePassRoute.post("/", async (req, res) => {
  try {
    // joi validation sbody data
    const validation = await schema.validateAsync(req.body);
  } catch (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  // check if user exist
  const user = await User.findOne({ _id: req.body.uid });

  if (!user) {
    res.status(400).json({ message: "user not found" });
    return;
  }

  // check if hash exist in hash collection
  const hash = await Hash.findOne({ hash: req.body.uHash });
  if (!hash) {
    res.status(400).json({ message: "hash not found" });
    return;
  }

  // check if hash = id
  if (hash.uid != req.body.uid) {
    res.status(400).json({ message: "hash not macthes" });
    return;
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);

  // change password
  user.password = hashedPass;

  // send res
  try {
    // save user
    await user.save();

    // generate user token
    const token = createToken(user.id);

    // remove hash
    await hash.remove();

    // pass token to cookie
    res.cookie("uToken", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "password changed successfully",
      code: "ok",
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error,
    });

    return;
  }
});

module.exports = changePassRoute;
