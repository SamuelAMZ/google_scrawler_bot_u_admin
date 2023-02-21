const express = require("express");
const logoutRoute = express.Router();

logoutRoute.get("/", (req, res) => {
  res.cookie("uToken", "", {
    maxAge: 1,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "logout successfully", code: "ok" });
  return;
});

module.exports = logoutRoute;
