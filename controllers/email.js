const asyncWrapper = require("../middlewares/async");
const EmailMsg = require("../models/Email");
const transporter = require("../utils/nodemailer");

const sendEmailCtrl = asyncWrapper(async (req, res) => {
  const { to, subject, message } = req.body;
  const msg = {
    to,
    subject,
    text: `There is a message for you from ${req.user.email}\n ${message}`,
    from: process.env.EMAIL,
  };
  await transporter.sendMail(msg);
  await EmailMsg.create({
    sentBy: req.user._id,
    from: req.user.email,
    to,
    subject,
    message,
  });

  res.json("email sent");
});

module.exports = { sendEmailCtrl };
