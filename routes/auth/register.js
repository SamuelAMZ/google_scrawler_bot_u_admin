const express = require("express");
const userRegisterRoute = express.Router();
const User = require("../../models/Users");
const Membership = require("../../models/Membership");
// axios
const axios = require("axios");
// validation
const Joi = require("@hapi/joi");
// hashing pass
const bcrypt = require("bcrypt");
// jwt
const { createToken } = require("./jwt");

const schema = Joi.object({
  username: Joi.string().max(1024).required(),
  name: Joi.string().max(1024).required(),
  email: Joi.string().email().max(1024).lowercase().required(),
  password: Joi.string().min(6).max(1024).required(),
  captcha: Joi.string().min(6).max(1024).required(),
});

userRegisterRoute.post("/", async (req, res) => {
  try {
    // joi validation sbody data
    const validation = await schema.validateAsync(req.body);
  } catch (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  // check captacha is valid
  let secretKey = process.env.CAPTCHA_SECRET;
  let captchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`;

  try {
    const response = await fetch(captchaUrl, {
      method: "POST",
    });

    const captchaResponse = await response.json();

    if (captchaResponse.success !== true) {
      return res.status(400).json({
        message: "captcha not valid or expired, refresh the page",
        code: "bad",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "captcha error, retry later", code: "bad" });
  }

  // hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);

  // getting actual data from body
  const user = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: hashedPass,
    tags: `${req.body.username} ${req.body.name}`,
    usernamesArray: [req.body.username],
    planType: "free",
    nextDue: "N/A",
    planFeatures: ["free content review"],
    legalStatus: "false",
  });

  try {
    // save user
    await user.save();
    // generate user token
    const token = createToken(user.id);

    // update membership on new user
    const membership = new Membership({
      uid: user._id,
      plan: "free",
      recuringType: "N/A",
      start: String(Date.now()),
      end: "1",
      features: ["free content review"],
    });
    await membership.save();

    // pass token to cookie
    res.cookie("uToken", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(201).json({
      message: "account created successfully",
      code: "ok",
      payload: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
    });
    return;
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyValue.username) {
        res.status(400).json({
          message: error.keyValue.username + " already exist",
        });
        return;
      }

      if (error.keyValue.email) {
        res.status(400).json({
          message: error.keyValue.email + " already exist",
        });
        return;
      }
    } else {
      res.status(400).json({
        message: error.message,
      });
    }
    return;
  }
});

module.exports = userRegisterRoute;
