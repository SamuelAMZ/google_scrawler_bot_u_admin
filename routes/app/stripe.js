const express = require("express");
const stripePayments = express.Router();
require("dotenv").config();
const Joi = require("@hapi/joi");

const schema = Joi.object({
  uid: Joi.string().max(1024).required(),
  price: Joi.string().max(1024).required(),
  plan: Joi.string().max(1024).required(),
  features: Joi.string().max(1024).required(),
  recuringType: Joi.string().max(1024).required(),
});

// stripe
const stripe = require("stripe")(process.env.STRIPE_KEY);

stripePayments.post("/", async (req, res) => {
  const { uid, price, plan, recuringType, features } = req.body;

  // joi validation sbody data
  try {
    const validation = await schema.validateAsync({
      uid,
      price,
      plan,
      recuringType,
      features,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.DOMAIN}/billing`,
      cancel_url: `${process.env.DOMAIN}/billing`,
      subscription_data: {
        metadata: { uid: uid },
      },
      metadata: { uid, plan, recuringType, features },
    });

    return res.status(200).json({
      message: `session created successfully`,
      code: "ok",
      payload: session.url,
    });
  } catch (error) {
    console.log(error, error.message);

    return res.status(500).json({
      message: `error when creating stripe session`,
      code: "bad",
    });
  }
});

module.exports = stripePayments;
