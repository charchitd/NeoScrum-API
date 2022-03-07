//  model 
 const mongo = require('mongoose')
 const joi = require('@hapi/joi');
const { string } = require('@hapi/joi');

 function omitPrivate(doc, obj) {
    delete obj.__v;
    return obj;
}

// schema options
var options = {
    toJSON: {
        transform: omitPrivate
    }
};


const NeoSchema = new mongo.Schema({

     
    userName: joi.string().required(),
    email: joi.string().trim().lowercase().required(),
    imgPath: joi.string().required().trim(),
    adminemail: joi.string().required().lowercase().trim(),
    passw: joi.string().required(),
    feedbackGivenBy: joi.array().items(joi.string().max(100)),
    feedback: joi.array().items(joi.string().max(100)),
        
    

}, {versionKey: false});

const userauth = mongo.model('userauth', NeoSchema);

module.exports = userauth;