const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const timeout = require("connect-timeout");

// app routes
const saveIdUpload = require("./routes/app/saveIdUpload");
const whitelistLink = require("./routes/app/whitelistLink");
const whitelistDomain = require("./routes/app/whitelistDomain");
const paginationRoute = require("./routes/app/pagination");
const removeTableItemRoute = require("./routes/app/removeTableItem");
const reportALeak = require("./routes/app/reportALeak");
const addNewUsername = require("./routes/app/newUsername");
const stripePayments = require("./routes/app/stripe");
const stripeWebhook = require("./routes/app/stripeWebHooks");

// auth routes
const userRegisterRoute = require("./routes/auth/register");
const userLoginRoute = require("./routes/auth/login");
const logoutRoute = require("./routes/auth/logout");
const isLoginRoute = require("./routes/auth/isLogin");
const generateResetPasswordHash = require("./routes/auth/resetPass/generateToken");
const changePassRoute = require("./routes/auth/resetPass/changePass");

// timeout
app.use(timeout(120000));
// cookies
app.use(cookieParser());

// cors
app.use(
  cors({
    origin: process.env.DOMAIN,
    credentials: true,
    optionSuccessStatus: 200,
  })
);

// connect mongoose
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URI, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to db");
  }
});

// set headers globally
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": process.env.DOMAIN,
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
  });
  next();
});

/*   
    @desc: stripe webhook
    @method: POST
    @privacy: public
    @endpoint: /api/webhook
*/
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// body parsing
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Server up");
});

/*   
    @desc: new account
    @method: POST
    @privacy: public
    @endpoint: /api/register
*/
app.use("/api/register", userRegisterRoute);
/*   
    @desc: login
    @method: POST
    @privacy: public
    @endpoint: /api/login
*/
app.use("/api/login", userLoginRoute);
/*   
    @desc: logout
    @method: POST
    @privacy: public
    @endpoint: /api/logout
*/
app.use("/api/logout", logoutRoute);
/*   
    @desc: is user login check
    @method: POST
    @privacy: public
    @endpoint: /api/is-login
*/
app.use("/api/is-login", isLoginRoute);
/*   
    @desc: genrate new hash for password reset
    @method: POST
    @privacy: public
    @endpoint: /api/new-hash
*/
app.use("/api/new-hash", generateResetPasswordHash);
/*   
    @desc: reset password after hash chech
    @method: POST
    @privacy: public
    @endpoint: /api/reset-password
*/
app.use("/api/reset-password", changePassRoute);
/*   
    @desc: upload id doc
    @method: POST
    @privacy: public
    @endpoint: /api/uploadid
*/
app.use("/api/uploadid", saveIdUpload);
/*   
    @desc: add link to skip to user doc
    @method: POST
    @privacy: public
    @endpoint: /api/linktoskip
*/
app.use("/api/linktoskip", whitelistLink);
/*   
    @desc: add domain to skip to user doc
    @method: POST
    @privacy: public
    @endpoint: /api/domaintoskip
*/
app.use("/api/domaintoskip", whitelistDomain);
/*   
    @desc: pagination
    @method: POST
    @privacy: public
    @endpoint: /api/pagination
*/
app.use("/api/pagination", paginationRoute);
/*   
    @desc: remove pagination item
    @method: POST
    @privacy: public
    @endpoint: /api/remove-table-item
*/
app.use("/api/remove-table-item", removeTableItemRoute);
/*   
    @desc: report a new leak
    @method: POST
    @privacy: public
    @endpoint: /api/report-leak
*/
app.use("/api/report-leak", reportALeak);
/*   
    @desc: add new username
    @method: POST
    @privacy: public
    @endpoint: /api/newusername
*/
app.use("/api/newusername", addNewUsername);
/*   
    @desc: stripe checkout
    @method: POST
    @privacy: public
    @endpoint: /api/checkout
*/
app.use("/api/checkout", stripePayments);

app.listen(process.env.PORT, () =>
  console.log(`app listen on port ${process.env.PORT}`)
);
