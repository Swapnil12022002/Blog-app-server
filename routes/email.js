const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { sendEmailCtrl } = require("../controllers/email");

router.route("/").post(authMiddleware, sendEmailCtrl);

module.exports = router;
