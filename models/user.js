const mongoose = require('mongoose');
const Joi = require('joi');

function user_validation(user) {
    const joi_user_schema = Joi.object
        ({
            first_name: Joi.string().required().min(3).max(120),
            last_name: Joi.string().required().min(3).max(120),
            email: Joi.string().email().required().min(3).max(120),
            contact: Joi.number().min(11).required(),
            password: Joi.string().min(6).max(1024).required(),
            city: Joi.string().min(2).max(1024),
            address: Joi.string().min(2).max(1024),
            //images: Joi.string().min(2).max(1024),
        })
    return result = joi_user_schema.validate(user);
}

const user_schema = new mongoose.Schema
    ({
        first_name:
        {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 120,
        },
        last_name:
        {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 120,
        },
        email:
        {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        contact:
        {
            type: Number,
            minlength: 11,
            maxlength: 11,
        },
        password:
        {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 1040
        },
        city:
        {
            type: String,
            required: true,
        },
        address:
        {
            type: String,
            required: true,
        },
        randomString:
        {
            type: String,
        },
        email_varification:
        {
            type: Boolean,
            default: false
        },
        redirection_link:
        {
            type: String,
            default: "https://www.google.com",
        },
        profile_photo: {
            type: String
        },
        favorite_tailors: [{
            tailor_id: {
                type: mongoose.Schema.Types.ObjectId
            },
            first_name: {
                type: String,
            },
            last_name: {
                type: String,
            },
            city: {
                type: String,
            },
            type_of_tailor: {
                type: String,
            }
        }]
    })

const User = mongoose.model('User', user_schema);
module.exports.User = User;
module.exports.user_validation = user_validation;

