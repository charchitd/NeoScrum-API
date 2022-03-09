// api routes

const express = require('express');
const userModel = require("../models/model.js");
// const {authSchema} = require('./authSchema')
const cookiesParser = require('cookie-parser');
const passcall = require('../Helpers/functions.js')
const multer = require('multer');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const path = require('path')

const bodyParser = require('body-parser'); //to process data sent through an HTTP request body.
const { access } = require("fs");
const { array } = require('@hapi/joi');
app.use(bodyParser.json());


app.use(cookiesParser());




//=================================================================

let ver;
let useremail;


// creating cookies

app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.ver;
  if (cookie === undefined) {
    // no: set a new cookie
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully');
  } else {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  } 
  next(); 
});





const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './data/images/')
    },
    filename: (req, file, cb) => {
        const filename = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
        cb(null, filename)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            req.fileValidationError = "Forbidden extension"
            cb(null, false, req.fileValidationError);
        }
    }
});


// function verifyToken(req, res,next) {  
//     //Get Auth header value  
//     const bearerHearder = req.headers['authorization'];  
//     //check if bearer is undefined  
//     if(typeof bearerHearder != 'undefined'){  
//         //split at the space  
//         const bearer = bearerHearder.split(' ');  
//         //Get the token from array  
//         const bearerToken = bearer[1];  
//         // set the token  
//         req.token = bearerToken;  
//         //Next middleware  
        
//         next();  
  
//     }else{  
//         //Forbidden  
//         res.sendStatus(403);  
//     }  


// } 




// ============================ APIs Routes ====================================



// register api -----------------------------------------------------------------------

app.post('/register', upload.single('image'), async (req, res, next) => {
     console.log(req.body);
    
    try {   
            
            const {userName, email, adminemail, password} = req.body
            const imgPath = `data/images/${req.file.filename}`
            
        
            if(adminemail != "admin@gmail.com" || password != "admin123")
            {    
                console.log('not admin')
                res.status(403).json({ msg: "Only admin can create user"})
                return 
            }

            const doesExist = await userModel.findOne({email:email})
            console.log("does exist is :",doesExist);

            if(doesExist)
            {
            //    throw createError.Conflict(`${email} is already exist...`);
               console.log('ths email already exist');
               res.status(403).json({
                   msg: `the email ${email} is already exist....`,
                
                
                });
               return;
            }

       
        // Calling password Generating.. 

        const pw = new passcall();
        const passw = pw.passGen();
        // console.log("passw is :", passw); // user 
        let feedback = []
        let feedbackGivenBy = []
        const user = new userModel({userName, email, imgPath, passw, feedbackGivenBy, feedback});
        const savedUser = await user.save();
        console.log(savedUser);
        

        
        console.log('success validation')
        res.status(200).json({
            
            msg: "Validation success record saved "
        });
    

  
        

    } catch (err) {

        if(err.isJoi === true) err.status =  422 // unprocessable entity
        console.error(err);
        next("Error", err);

        res.status(401).json({  // unauthorized
            
            msg: "error in authenticating"
        }) 
    }


  

});

// Login ------------------------------------------------------------------------------

app.post('/login', async (req, res) => {


  const {email, passw} = req.body;
  
   const doesExist = await userModel.findOne({email:email})
  console.log("email is:",email)
//   console.log("Doesexist is: ",doesExist);
  if(doesExist)
  {

    // res.send(' Email is found');
    //const doespassExist = await userModel.findOne({passw:passw});
       if(doesExist.passw == passw)
        {
            
            const token = jwt.sign({
                
                

                email:email,
                passw:passw,

            }, "SecretKey", {expiresIn: "30h"});


            useremail = email
            console.log('login success');
            res.status(201).send({
                msg: "Successfully Loggedin",
                token:token
            });
        }
        else{

            console.log('Wrong Password');
            res.status(404).json('Wrong Password');
        }
  }
  else{
    console.log(`email ${email} not found`);
    res.status(401).json(`email ${email} not found`);

  }

});

// dashboard display for loggedin user --------------------------------------------------------------

app.get('/dashboard', async (req, res) => {

    console.log('====== Dashboard =======');
    
        const token = req.body.token;
  
    //       console.log(jwt.verify(token, "SecretKey"));
          jwt.verify(token, "SecretKey", (er, authdata) => {

            if(er)
            {
                res.status(400).json({ msg: 'Error: Not a Valid Token'});
            }
            else{
                console.log(authdata);
                ver = authdata;
                // ver = authdata;
                // res.json({
                //     msg: 'Valid Token: Success',
                //     authdata
                // })
            }
        })

        const AllData = await userModel.find({});
        const displayfeeds = []
        
        AllData.forEach((user) => {
            

            if(ver.email == user.email && user.feedback != null && user.feedback.length > 0 && user.userName != "Admin")
            {

               var display = {
                    id: user._id,
                    name: user.userName,
                    image: user.imgPath,
                    feedback: user.feedback,
                    postBy: user.feedbackGivenBy
                }
                displayfeeds.push(display)
                // displaydata.push(JSON.stringify(display))
                // displaydata.push(user.feedback)
                // displaydata.push(user.feedbackGivenBy)
                console.log(display)
                // console.log(user.userName);
                // console.log(user.imgPath);
                // console.log("Feedback:",user.feedback)
                // console.log("posted by:",user.feedbackGivenBy)
           }
            
        })

        res.status(201).json({
            msg: "Valid Token: Success",
            displayfeeds
            
        })

});

// dashboard feedback ---------------------------------------------------------------------------------------

app.get('/feedback', async (req, res) => {
    
    
    if(ver == undefined)
    {
        res.status(401).json({
            
            msg: "Unauthorized user"
        })
        return 
    }
    const AllData = await userModel.find({});
    const displaydata = []

    AllData.forEach((user) => {
        var adduser = true;

        if(ver.email != user.email && user.adminemail != "admin@gmail.com")
        {
            for(const x in user.feedbackGivenBy)
            {
            
                if(ver.email == user.feedbackGivenBy[x])
                {

                    adduser = false
                    // displaydata.push(JSON.stringify(user.imgPath))
                    //console.log(toFeeds);
                    // console.log(user.imgPath);
                    
                    // console.log(user.email);, fromIndex
                }
            }
            if(adduser == true){
                var toFeeds = {

                    name: user.userName,
                    image: user.imgPath,
                }
                displaydata.push(toFeeds)
            }
        }
    })
    
    res.json({
        
        msg:'Dashboard updated',
        displaydata
        
        
    });

});


// adding feedback -------------------------------------------------

app.post('/addfeedback', async (req, res) => {


    const feedback = req.body.feedback;
    const email = req.body.email;

    const currfb = await userModel.findOne({email});

    // const user = new userModel({userName, email, imgPath, passw,feedback});
    // const savedUser = await user.save();
    console.log(feedback);
    console.log("currfb is: ", currfb);
    console.log("useremail : ", ver.email);

    console.log(currfb);
    if (currfb)
    {
        for (let obj in currfb.feedbackGivenBy)
        {
            // console.log("obj is " , currfb.feedbackGivenBy[obj])
            if (ver.email == currfb.feedbackGivenBy[obj])
            {
                console.log('feedback already given');
                res.status(403).json({
                    msg: "feedback is already given...",
                    
                    })
                return 
            }
        }

        currfb.feedback.push(feedback)
        currfb.feedbackGivenBy.push(ver.email)
        console.log('feedback added')

        const updatefeed = await userModel.updateOne({email:email}, {$set:{feedbackGivenBy:currfb.feedbackGivenBy, feedback:currfb.feedback}});
        console.log(updatefeed);
        //userModel.save();
        //console.log(currfb);
        res.status(201).json({
            msg: "feedback added",

        })
    }
    else{
        console.log('user not found')
        res.json({
            msg:'user not found',
        status: false
    })
    }

});
// ==========================================================================

module.exports = app;

// kill port
// lsof -i :3070
// kill -9 <PID>
