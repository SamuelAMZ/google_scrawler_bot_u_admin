const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const isLoginRoute = express.Router();
const User = require("../../models/Users");
const Membership = require("../../models/Membership");

// check user token and know if it s valid token of a valid user or not
isLoginRoute.get("/", async (req, res) => {
  const uToken = req.cookies.uToken;

  if (uToken) {
    // check if token is valid
    jwt.verify(uToken, process.env.JWT_U_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.status(403).json({ message: "isNotLogin err", status: "false" });
        return;
      } else {
        // check if token uid is found in the user database
        const uId = decodedToken.id;
        const idExist = await User.findById(uId);

        if (idExist === null || !idExist) {
          res.locals.user = null;
          res.status(403).json({ message: "isNotLogin id", status: "false" });
          return;
        } else {
          // check for pages
          res.locals.user = idExist;

          // get user membership info
          const userMembership = await Membership.findOne({ uid: idExist._id });
          if (!userMembership) {
            return res
              .status(403)
              .json({ message: "memebership not found", status: "false" });
          }

          // convert next due to date
          let a = new Date(Number(userMembership.end) * 1000);
          let months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          let year = a.getFullYear();
          let month = months[a.getMonth()];
          let date = a.getDate();
          let time = date + " " + month + " " + year;

          res.status(200).json({
            message: "isLogin",
            status: "true",
            user: {
              email: idExist.email,
              username: idExist.username,
              name: idExist.name,
              id: idExist._id,
              date: idExist.createdAt,
              usernamesArray: idExist.usernamesArray,
              legalStatus: idExist.legalStatus,
              planType: userMembership.plan,
              nextDue: userMembership.end === "1" ? "N/A" : time,
              planFeatures: userMembership.features,
            },
          });
          return;
        }
      }
    });
  } else {
    res.locals.user = null;
    res.status(403).json({ message: "isNotLogin else", status: "false" });
    return;
  }
});

module.exports = isLoginRoute;
