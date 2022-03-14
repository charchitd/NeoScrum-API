const nodemailer = require('nodemailer');
const config = require('../config/auth.config');

const userid = config.userid;
const pass = config.pass;
const transport = nodemailer.createTransport({

    service: "Gmail",
    auth: {
        user: userid,
        pass: pass,
    },
});

module.exports.sendConfirmationEmail = (user, email, password) => {
    console.log("Check");
    transport.sendMail({
      from: user,
      to: email,
      subject: "Welcome to NeoScrum",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${user}</h2>
          <p>Thank you for registering... Your password is : ${password}</p>
          </div>`,
    }).catch(err => console.log(err));
  };