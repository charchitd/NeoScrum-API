// api routes

const express = require('express');
const userModel = require("../models/model.js");
const valid = require('../Helpers/validation.js');
// const {authSchema} = require('./authSchema')
const cookiesParser = require('cookie-parser');
const passcall = require('../Helpers/functions.js')
const multer = require('multer');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const app = express();
const cors = require('cors');
const path = require('path');
const nodemailer = require('../Helpers/mailer');
const bodyParser = require('body-parser'); //to process data sent through an HTTP request body.
const { access } = require("fs");
const { array } = require('@hapi/joi');
app.use(bodyParser.json());


app.use(cookiesParser());


//app.use('/static', express.static(path.join(__dirname, 'data/images')));
app.use(express.static('../data/images/'))


//=================================================================


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './data/images')
    },
    filename: (req, file, cb) => {
        const filename = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
        cb(null, filename)
    }
});

const upload = multer({
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



// ============================ APIs Routes ====================================



// register api -----------------------------------------------------------------------

app.post('/register', upload.single('image'), async (req, res, next) => {
     console.log(req.body);
    
    try {   
            
            const {userName, email, adminemail, password} = req.body
            const imgPath = `http://localhost:2100/${req.file.filename}`
            
        
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

        // const pw = new passcall();
        const passw = passcall.passGen();

        // email sender...
        nodemailer.sendConfirmationEmail(
            userName,
            email,
            passw
        );
        const hashpsw = bcrypt.hashSync(passw, 10);
        console.log('hashw is ', hashpsw)
        // console.log("passw is :", passw); // user 
        let feed = {}
        let feedback = []
        //let feedbackGivenBy = []
        const user = new userModel({userName, email, imgPath, hashpsw,feedback});
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

    try{

  const {email, passw} = req.body;
  
   const doesExist = await userModel.findOne({email:email})
  console.log("email is:",email)
  console.log("Doesexist is: ",doesExist.hashpsw);
  if(doesExist)
  {

    // res.send(' Email is found');
    //const doespassExist = await userModel.findOne({passw:passw});
    //    if(doesExist.passw == passw)
    const verified = bcrypt.compareSync(passw, doesExist.hashpsw);
        // if res == true, password matched
        // else wrong password
      if(verified == true)
        {
            
            const token = jwt.sign({
                
                

                email:email,
                passw:passw,

            }, "SecretKey", {expiresIn: "16h"});


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
    } catch(er){

        console.error(er);
        res.status(400).json({
            msg: "ERROR"
        })
    }
});

// dashboard display for loggedin user --------------------------------------------------------------

app.get('/dashboard', async (req, res) => {

    try{
    console.log('====== Dashboard =======');
    
        const token = req.headers.token;
        
        // const veri = new valid();
        var vemail = valid.verifyToken(token);
        console.log(vemail)
        if (vemail != null){
           //---ver.email-----      
            console.log('Valid token input');
            const AllData = await userModel.find({});
            const displayfeeds = []
           
            AllData.forEach((user) => {
                
                // ver.email
                if(vemail == user.email && user.feedback != null && user.feedback.length > 0 && user.userName != "Admin")
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
        //------
        }else{
            res.status(400).json({ msg: 'Error: Not a Valid Token'});
            return
        }
    
    }catch(er){

        console.error(er);
        res.status(400).json({
            msg: "ERROR"
        })
    }
});

// dashboard feedback ---------------------------------------------------------------------------------------

app.get('/feedback', async (req, res) => {
   
    try{
        const token = req.headers.token
        // const veri = new valid();
        var vemail = valid.verifyToken(token);
        console.log("email is :", vemail)
        if (vemail != null){
           //--------      
            console.log('Valid token input');
            
            const AllData = await userModel.find({});
    const displaydata = []

    AllData.forEach((user) => {
        var adduser = true;
        // ver.email
        if(vemail != user.email && user.adminemail != "admin@gmail.com")
        {
            for(let x in user.feedbackGivenBy)
            {
               
                if(vemail == user.feedbackGivenBy[x])
                {

                    adduser = false
                    // displaydata.push(JSON.stringify(user.imgPath))
                    //console.log(toFeeds);
                    // console.log(user.imgPath);
                    
                    // console.log(user.email);, fromIndex
                }
            }
            if(adduser == true){
                let toFeeds = {
                    email: user.email,
                    name: user.userName,
                    image: user.imgPath,
                }
                displaydata.push(toFeeds)
            }
        }

        // creating copy array


        // if(d.length > 0)
        // {
        //     var index = Math.floor(Math.random()*displaydata.length)
        //     var randomdisplay = displaydata[index];
        //     newArray.splice(index, 1);
        //     console.log(randomdisplay)
        // }
    })
    let size = displaydata.length 
    // console.log(size);
    if(size > 3)
    {
        const newArray = []
        let arr = [];
        while(arr.length < 3){
            let r = Math.floor(Math.random() * size) ;
            if(arr.indexOf(r) === -1) arr.push(r);
        }
        for (var i=0; i<3; i++)
        {
            newArray.push(displaydata[arr[i]]);
        }
        res.json({
            
            msg:'Dashboard updated',
            newArray,
        });
    }
    else{
        res.json({
            msg:'Dashboard updated',
            displaydata,
        });
    }
        //------
        }else{
            res.status(400).json({ msg: 'Error: Not a Valid Token and Unauthorized user'});
            return
        }
        // ----------
    
    
    
    } catch(er){

        console.error(er);
        res.status(400).json({
            msg: "ERROR"
        })
    }
});


// adding feedback -------------------------------------------------

app.post('/addfeedback', async (req, res) => {

    try
    {
    const token = req.headers.token;
    
    // const veri = new valid();
        let vemail = valid.verifyToken(token);
        console.log(vemail)
        if (vemail != null){
           //--------      
            console.log('Valid token input');
            
            const feedback = req.body.feedback;
            const email = req.body.email;
        
            const currfb = await userModel.findOne({email});
        
            // const user = new userModel({userName, email, imgPath, passw,feedback});
            // const savedUser = await user.save();
            console.log(feedback);
            console.log("currfb is: ", currfb);
            console.log("useremail : ", vemail); //ver.email
        
            console.log(currfb);
            if (currfb)
            {
                for (let obj in currfb.feedback.feedbackGivenBy)
                {
                    // console.log("obj is " , currfb.feedbackGivenBy[obj])
                    let feedbackGivenById = currfb.feedback.id[obj]
                    let feedbackGivenByEmail  = await userModel.findOne({feedbackGivenById});
                    if (vemail == feedbackGivenByEmail.email) // ver.email
                    {
                        console.log('feedback already given');
                        res.status(403).json({
                            msg: "feedback is already given...",
                            
                            })
                        return 
                    }
                }
        
                
                //currfb.feedbackGivenBy.push(vemail) // ver.email
                console.log('feedback added')
                var nowDate = new Date(); 
                var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
                const data = {feedback:feedback, id:currfb._id, PostedOn: date}
                currfb.feedback.push(data)
                const updatefeed = await userModel.updateOne({email:email}, {$set:{feedback:currfb.feedback}});
                console.log(updatefeed);
                let store = currfb.feedback;
                console.log('store: ', store)
                res.status(201).json({
                    msg: "feedback added",
                    store               })
            }
            else{
                console.log('user not found')
                res.json({
                    msg:'user not found',
                status: false
            })
            }
        //------
        }else{
            res.status(400).json({ msg: 'Error: Not a Valid Token'});
            return
        }
  
    } catch(er){

        console.error(er);
        res.status(400).json({
            msg: "ERROR"
        })
    
    }
});
// ==========================================================================

module.exports = app;

// kill port
// lsof -i :3070
// kill -9 <PID>
