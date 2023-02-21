const express = require("express");
const stripeWebhook = express.Router();
require("dotenv").config();

// stripe
const stripe = require("stripe")(process.env.STRIPE_KEY);

// helpers
const handleFirstSubscription = require("../../helpers/checkout/handleFirstSubscription");
const handleFailedSubscriptions = require("../../helpers/checkout/handleFailedSubscriptions");

stripeWebhook.post("/", async (req, res) => {
  let data;
  let eventType;

  // Check if webhook signing is configured.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  switch (eventType) {
    case "checkout.session.completed":
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      console.log(data.object);
      await handleFirstSubscription(data.object);

      break;
    case "invoice.paid":
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      await handleFirstSubscription(data.object);
      break;
    case "invoice.payment_failed":
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      await handleFailedSubscriptions(data.object);
      break;
    default:
    // Unhandled event type
  }

  res.sendStatus(200);
});

module.exports = stripeWebhook;
