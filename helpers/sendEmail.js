// this file will handle emails ending
const axios = require("axios");

const sendEMail = async (messageToSend, subject, toName, toEmail) => {
  // send email
  let url = "https://api.sendgrid.com/v3/mail/send";
  let config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
  };

  axios
    .post(
      url,
      {
        personalizations: [
          {
            to: [{ email: toEmail, name: toName }],
            subject: subject,
          },
        ],
        content: [{ type: "text/html", value: messageToSend }],
        from: { email: "no-reply@takedownly.com", name: "Takedownly" },
        reply_to: {
          email: "no-reply@takedownly.com",
          name: "Takedownly",
        },
      },
      config
    )
    .then(function (response) {
      return true;
    })
    .catch(function (error) {
      console.log(error);
      console.log(error.message);
      return false;
    });
};

module.exports = sendEMail;
