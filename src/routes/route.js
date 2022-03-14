// api routes

const express = require("express");
const userModel = require("../models/model.js");
const valid = require("../Helpers/validation.js");

// const {authSchema} = require('./authSchema')
const cookiesParser = require("cookie-parser");
const passcall = require("../Helpers/passfunc.js");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const controller = require("../controller/maincontroller");
const app = express();
const cors = require("cors");
const path = require("path");
const nodemailer = require("../Helpers/mailer");
const bodyParser = require("body-parser"); //to process data sent through an HTTP request body.
const { access } = require("fs");
const { array } = require("@hapi/joi");
app.use(bodyParser.json());

app.use(cookiesParser());

//app.use('/static', express.static(path.join(__dirname, 'data/images')));
app.use(express.static("../data/images/"));

//====================== multer operation ===========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./data/images");
  },
  filename: (req, file, cb) => {
    const filename =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      req.fileValidationError = "Forbidden extension";
      cb(null, false, req.fileValidationError);
    }
  },
});

// ============================ APIs Routes ====================================

// register api -----------------------------------------------------------------------

app.post("/register", upload.single("image"), controller.register);

// Login ------------------------------------------------------------------------------

app.post("/login", controller.login);

// dashboard display for loggedin user --------------------------------------------------------------

app.get("/dashboard", controller.dashboard);

// dashboard feedback ---------------------------------------------------------------------------------------

app.get("/feedback", controller.feedback);

// adding feedback -------------------------------------------------

app.post("/addfeedback", controller.addfeedback);

module.exports = app;

// kill port
// lsof -i :2100
// kill -9 <PID>
