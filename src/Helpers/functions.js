// functions 

const generator = require('generate-password');
const userModel = require('../models/model.js');
const mongo = require('mongoose');

module.exports = function () {

    this.passGen = () =>{
    console.log('inside pssgen')
    const pass = generator.generate({

        length: 10,

    });

    // const passw = userModel({pass})
    // passw.save();

    console.log("Password Successfully Created :", pass);
    return pass;
    

    
}}
//  const pp = passGen();

 
