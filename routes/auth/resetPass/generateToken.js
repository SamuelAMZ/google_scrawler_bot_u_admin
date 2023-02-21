const express = require("express");
const generateResetPasswordHash = express.Router();
const User = require("../../../models/Users");
const Hash = require("../../../models/Hash");
// crypto
const crypto = require("crypto");
// axios
const axios = require("axios");
// validation
const Joi = require("@hapi/joi");
// email helper
const sendEMail = require("../../../helpers/sendEmail");

const schema = Joi.object({
  emailOrUsername: Joi.string().lowercase().required(),
  captcha: Joi.string().required(),
});

generateResetPasswordHash.post("/", async (req, res) => {
  const { emailOrUsername, captcha } = req.body;

  try {
    // joi validation sbody data
    const validation = await schema.validateAsync({
      emailOrUsername,
      captcha,
    });
  } catch (error) {
    res.status(400).json({ message: error.details[0].message, code: "bad" });
    return;
  }

  // check captacha is valid
  let secretKey = process.env.CAPTCHA_SECRET;
  let captchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

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

  // check if user exist
  // push data to it if username or email found
  const verifier = [];
  let userFound;

  // check for the email address in the db
  const checkUser = await User.findOne({ email: emailOrUsername });
  if (checkUser) {
    verifier.push(1);
    userFound = checkUser;
  }

  // check for the username in the db
  const checkUsername = await User.findOne({ username: emailOrUsername });
  if (checkUsername) {
    verifier.push(1);
    userFound = checkUsername;
  }

  if (verifier.length === 0) {
    res
      .status(400)
      .json({ message: "email or username not found", code: "bad" });
    return;
  }

  // generate a random hash
  let current_date = new Date().valueOf().toString();
  let random = Math.random().toString();
  const hash = crypto
    .createHash("sha1")
    .update(current_date + random)
    .digest("hex");

  // get user id
  const uid = userFound._id;
  const name = userFound.name;
  const email = userFound.email;

  // save hash and uid in db (hash collection)
  try {
    const newHash = new Hash({
      uid,
      hash,
    });
    await newHash.save();
  } catch (error) {
    console.log(error, error.message);
    res
      .status(500)
      .json({ message: "server error saving hashes", code: "bad" });
    return;
  }

  // send email with link to reset password
  const link = `${process.env.DOMAIN}/reset-pass/${uid}/${hash}`;
  // message to send
  let messageToSend = `<!DOCTYPE html>
  <html
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    lang="en"
  >
    <head>
      <title></title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <!--[if mso
        ]><xml
          ><o:OfficeDocumentSettings
            ><o:PixelsPerInch>96</o:PixelsPerInch
            ><o:AllowPNG /></o:OfficeDocumentSettings></xml
      ><![endif]-->
      <!--[if !mso]><!-->
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
        type="text/css"
      />
      <!--<![endif]-->
      <style>
        * {
          box-sizing: border-box;
        }
  
        body {
          margin: 0;
          padding: 0;
        }
  
        a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: inherit !important;
        }
  
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
        }
  
        p {
          line-height: inherit;
        }
  
        .desktop_hide,
        .desktop_hide table {
          mso-hide: all;
          display: none;
          max-height: 0px;
          overflow: hidden;
        }
  
        @media (max-width: 620px) {
          .desktop_hide table.icons-inner {
            display: inline-block !important;
          }
  
          .icons-inner {
            text-align: center;
          }
  
          .icons-inner td {
            margin: 0 auto;
          }
  
          .image_block img.big,
          .row-content {
            width: 100% !important;
          }
  
          .mobile_hide {
            display: none;
          }
  
          .stack .column {
            width: 100%;
            display: block;
          }
  
          .mobile_hide {
            min-height: 0;
            max-height: 0;
            max-width: 0;
            overflow: hidden;
            font-size: 0px;
          }
  
          .desktop_hide,
          .desktop_hide table {
            display: table !important;
            max-height: none !important;
          }
  
          .row-4 .column-1 .block-3.text_block td.pad {
            padding: 10px !important;
          }
  
          .row-4 .column-1 .block-2.paragraph_block td.pad > div {
            font-size: 14px !important;
          }
  
          .row-4 .column-1 .block-2.paragraph_block td.pad {
            padding: 10px 20px 0 !important;
          }
        }
      </style>
    </head>
  
    <body
      style="
        background-color: #ededed;
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: none;
        text-size-adjust: none;
      "
    >
      <table
        class="nl-container"
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        style="
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          background-color: #ededed;
        "
      >
        <tbody>
          <tr>
            <td>
              <table
                class="row row-1"
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
              >
                <tbody>
                  <tr>
                    <td>
                      <table
                        class="row-content stack"
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          color: #000000;
                          border-radius: 0;
                          width: 600px;
                        "
                        width="600"
                      >
                        <tbody>
                          <tr>
                            <td
                              class="column column-1"
                              width="100%"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                font-weight: 400;
                                text-align: left;
                                vertical-align: top;
                                padding-top: 30px;
                                padding-bottom: 5px;
                                border-top: 0px;
                                border-right: 0px;
                                border-bottom: 0px;
                                border-left: 0px;
                              "
                            >
                              <table
                                class="empty_block block-1"
                                width="100%"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                "
                              >
                                <tr>
                                  <td class="pad">
                                    <div></div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                class="row row-2"
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
              >
                <tbody>
                  <tr>
                    <td>
                      <table
                        class="row-content stack"
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          color: #000000;
                          width: 600px;
                        "
                        width="600"
                      >
                        <tbody>
                          <tr>
                            <td
                              class="column column-1"
                              width="100%"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                font-weight: 400;
                                text-align: left;
                                vertical-align: top;
                                padding-top: 5px;
                                padding-bottom: 0px;
                                border-top: 0px;
                                border-right: 0px;
                                border-bottom: 0px;
                                border-left: 0px;
                              "
                            >
                              <table
                                class="image_block block-1"
                                width="100%"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                "
                              >
                                <tr>
                                  <td
                                    class="pad"
                                    style="
                                      width: 100%;
                                      padding-right: 0px;
                                      padding-left: 0px;
                                    "
                                  >
                                    <div
                                      class="alignment"
                                      align="center"
                                      style="line-height: 10px"
                                    >
                                      <img
                                        class="big"
                                        src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/939676_924125/unnamed%20%282%29.png"
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 600px;
                                          max-width: 100%;
                                        "
                                        width="600"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                class="row row-3"
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
              >
                <tbody>
                  <tr>
                    <td>
                      <table
                        class="row-content stack"
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          background-color: #ffffff;
                          color: #000000;
                          width: 600px;
                        "
                        width="600"
                      >
                        <tbody>
                          <tr>
                            <td
                              class="column column-1"
                              width="100%"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                font-weight: 400;
                                text-align: left;
                                vertical-align: top;
                                padding-top: 5px;
                                padding-bottom: 5px;
                                border-top: 0px;
                                border-right: 0px;
                                border-bottom: 0px;
                                border-left: 0px;
                              "
                            >
                              <table
                                class="image_block block-1"
                                width="100%"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                "
                              >
                                <tr>
                                  <td
                                    class="pad"
                                    style="
                                      width: 100%;
                                      padding-right: 0px;
                                      padding-left: 0px;
                                    "
                                  >
                                    <div
                                      class="alignment"
                                      align="center"
                                      style="line-height: 10px"
                                    >
                                      <img
                                        src="https://d15k2d11r6t6rl.cloudfront.net/public/users/BeeFree/beefree-u27jfci5cc/logo.png"
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 180px;
                                          max-width: 100%;
                                        "
                                        width="180"
                                        alt="Image"
                                        title="Image"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              <table
                                class="text_block block-2"
                                width="100%"
                                border="0"
                                cellpadding="10"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  word-break: break-word;
                                "
                              >
                                <tr>
                                  <td class="pad">
                                    <div style="font-family: sans-serif">
                                      <div
                                        class
                                        style="
                                          font-size: 12px;
                                          mso-line-height-alt: 18px;
                                          color: #555555;
                                          line-height: 1.5;
                                          font-family: Space Mono, monospace,
                                            Trebuchet MS, Lucida Grande,
                                            Lucida Sans Unicode, Lucida Sans,
                                            Tahoma, sans-serif;
                                        "
                                      >
                                        <p
                                          style="
                                            margin: 0;
                                            font-size: 14px;
                                            text-align: center;
                                            mso-line-height-alt: 18px;
                                          "
                                        >
                                          <span style="font-size: 12px"
                                            >Get rid of leaked content.</span
                                          >
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                class="row row-4"
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
              >
                <tbody>
                  <tr>
                    <td>
                      <table
                        class="row-content stack"
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          background-color: #ffffff;
                          color: #000000;
                          width: 600px;
                        "
                        width="600"
                      >
                        <tbody>
                          <tr>
                            <td
                              class="column column-1"
                              width="100%"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                font-weight: 400;
                                text-align: left;
                                vertical-align: top;
                                padding-top: 0px;
                                padding-bottom: 5px;
                                border-top: 0px;
                                border-right: 0px;
                                border-bottom: 0px;
                                border-left: 0px;
                              "
                            >
                              <table
                                class="text_block block-1"
                                width="100%"
                                border="0"
                                cellpadding="10"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  word-break: break-word;
                                "
                              >
                                <tr>
                                  <td class="pad">
                                    <div style="font-family: sans-serif">
                                      <div
                                        class
                                        style="
                                          font-size: 12px;
                                          mso-line-height-alt: 14.399999999999999px;
                                          color: #0d0d0d;
                                          line-height: 1.2;
                                          font-family: Space Mono, monospace,
                                            Trebuchet MS, Lucida Grande,
                                            Lucida Sans Unicode, Lucida Sans,
                                            Tahoma, sans-serif;
                                        "
                                      >
                                        <p
                                          style="
                                            margin: 0;
                                            font-size: 14px;
                                            text-align: center;
                                            mso-line-height-alt: 16.8px;
                                          "
                                        >
                                          <span style="font-size: 20px"
                                            ><strong
                                              ><span style
                                                >You requested a password reset!</span
                                              ></strong
                                            ></span
                                          >
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
  
                              <!-- here -->
                              <table
                                class="paragraph_block block-2"
                                width="100%"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  word-break: break-word;
                                "
                              >
                                <tr>
                                  <td
                                    class="pad"
                                    style="
                                      padding-top: 10px;
                                      padding-right: 40px;
                                      padding-left: 40px;
                                    "
                                  >
                                    <div
                                      style="
                                        color: #101112;
                                        font-size: 16px;
                                        font-family: Space Mono, monospace,
                                          Trebuchet MS, Lucida Grande,
                                          Lucida Sans Unicode, Lucida Sans, Tahoma,
                                          sans-serif;
                                        font-weight: 400;
                                        line-height: 120%;
                                        text-align: left;
                                        direction: ltr;
                                        letter-spacing: 0px;
                                        mso-line-height-alt: 19.2px;
                                      "
                                    >
                                      <p style="margin: 0">
                                        <br /><br />
To reset your password, please click on this link
<br/><br/>
 <a href="${link}">Link</a>.
<br/><br/>
Thank you for choosing Takedownly. We are dedicated to providing the best possible service and look forward to assisting you further.
<br/><br/>
Best regards,
<br/>
The Takedownly Team

                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </table>
  
                              <table
                                class="text_block block-3"
                                width="100%"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  word-break: break-word;
                                "
                              >
                                <tr>
                                  <td
                                    class="pad"
                                    style="
                                      padding-bottom: 50px;
                                      padding-left: 60px;
                                      padding-right: 10px;
                                      padding-top: 10px;
                                    "
                                  >
                                    <div
                                      style="
                                        font-family: Space Mono, monospace,
                                          Verdana, sans-serif;
                                      "
                                    >
                                      <div
                                        class
                                        style="
                                          font-size: 12px;
                                          font-family: Space Mono, monospace,
                                            Tahoma, Verdana, Segoe, sans-serif;
                                          mso-line-height-alt: 18px;
                                          color: #0d0d0d;
                                          line-height: 1.5;
                                        "
                                      ></div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                class="row row-5"
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
              >
                <tbody>
                  <tr>
                    <td>
                      <table
                        class="row-content stack"
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          color: #000000;
                          width: 600px;
                        "
                        width="600"
                      >
                        <tbody>
                          <tr>
                            <td
                              class="column column-1"
                              width="100%"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                font-weight: 400;
                                text-align: left;
                                vertical-align: top;
                                padding-top: 0px;
                                padding-bottom: 5px;
                                border-top: 0px;
                                border-right: 0px;
                                border-bottom: 0px;
                                border-left: 0px;
                              "
                            >
                              <table
                                class="image_block block-1"
                                width="100%"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                "
                              >
                                <tr>
                                  <td
                                    class="pad"
                                    style="
                                      width: 100%;
                                      padding-right: 0px;
                                      padding-left: 0px;
                                      padding-bottom: 60px;
                                    "
                                  >
                                    <div
                                      class="alignment"
                                      align="center"
                                      style="line-height: 10px"
                                    >
                                      <img
                                        class="big"
                                        src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/20/rounder-dwn.png"
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 600px;
                                          max-width: 100%;
                                        "
                                        width="600"
                                        alt="Image"
                                        title="Image"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                class="row row-6"
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
              >
                <tbody>
                  <tr>
                    <td>
                      <table
                        class="row-content stack"
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          color: #000000;
                          width: 600px;
                        "
                        width="600"
                      >
                        <tbody>
                          <tr>
                            <td
                              class="column column-1"
                              width="100%"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                font-weight: 400;
                                text-align: left;
                                vertical-align: top;
                                padding-top: 5px;
                                padding-bottom: 5px;
                                border-top: 0px;
                                border-right: 0px;
                                border-bottom: 0px;
                                border-left: 0px;
                              "
                            >
                              <table
                                class="icons_block block-1"
                                width="100%"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                "
                              >
                                <tr>
                                  <td
                                    class="pad"
                                    style="
                                      vertical-align: middle;
                                      color: #9d9d9d;
                                      font-family: inherit;
                                      font-size: 15px;
                                      padding-bottom: 5px;
                                      padding-top: 5px;
                                      text-align: center;
                                    "
                                  >
                                    <table
                                      width="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                    >
                                      <tr>
                                        <td
                                          class="alignment"
                                          style="
                                            vertical-align: middle;
                                            text-align: center;
                                          "
                                        ></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- End -->
    </body>
  </html>
  `;

  try {
    await sendEMail(messageToSend, "Reset password request", name, email);
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "server error sending email", code: "bad" });
    return;
  }

  // send res
  res.status(200).json({
    message: "hash generated and email sent successfully",
    code: "ok",
  });
  return;
});

module.exports = generateResetPasswordHash;
