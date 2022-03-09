// server

const express = require('express');
const app = express();
const cookiesParser = require('cookies-parser');

const mongo = require('mongoose');
const bodyParser = require('body-parser');
const router = require('./routes/route.js');
const port = 2100;

app.use(express.json());


// connecting mongoDB

app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

mongo.connect('mongodb+srv://CD:mongo1234@myserver.92rfp.mongodb.net/NeoScrum?retryWrites=true&w=majority')
// mongo.connect('mongodb+srv://CD:<password>@myserver.92rfp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')

const db = mongo.connection;
db.on('error', () => {
    console.log('Connection Failed');

});


db.on('connected', () => {
  
    console.log('Connection with DB Successfull');

})
app.use(router);
app.use('/', (req, res) => {
    
    res.send('Testing ApI');
})


app.listen(port, () => { console.log(`Listening port : ${port}`)});