const express = require("express");
const multer = require("multer");

module.exports.storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./data/images");
  },
  filename: (req, file, cb) => {
    const filename =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

module.exports.upload = multer({
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
