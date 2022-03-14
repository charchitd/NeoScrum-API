const express = require("express");
const jwt = require("jsonwebtoken");

module.exports.verifyToken = function (token) {
  let vemail = null; // async await
  jwt.verify(token, "SecretKey", (er, authdata) => {
    console.log("token is", token);
    if (er) {
      //res.status(400).json({ msg: 'Error: Not a Valid Token'});
      console.log("Error: Not a Valid Token");
    } else {
      console.log("inside authdata");
      console.log(authdata);
      vemail = authdata.email;
    }
  });
  return vemail;
};

// module.export.verifyToken = (token) => {
//     //return true;

//     //Get Auth header value
//     jwt.verify(token, "SecretKey", async (er, authdata) => {
//         console.log("token is",token);
//         if(er)
//         {
//             //res.status(400).json({ msg: 'Error: Not a Valid Token'});
//             console.log("Error: Not a Valid Token")
//             return false
//         }
//         else{
//             console.log("inside authdata")
//             console.log(authdata);
//             ver = authdata;
//         }
//     })
//     return true
// }
