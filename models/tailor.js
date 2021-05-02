const mongoose = require('mongoose');
const Joi = require('joi');
const { number } = require('joi');

function tailor_validation(tailor) {
    const joi_tailor_schema = Joi.object
        ({
            first_name: Joi.string().required().min(3).max(120),
            last_name: Joi.string().required().min(3).max(120),
            email: Joi.string().email().required().min(3).max(120),
            contact: Joi.number().min(11).required(),
            password: Joi.string().min(6).max(1024).required(),
            city: Joi.string().min(2).max(1024),
            address: Joi.string().min(2).max(1024),
            experience: Joi.number().required(),
            type_of_tailor: Joi.string().min(2).max(1024), //ladies or gents
            average_rate_per_stitching: Joi.number().required(),
            //images: Joi.string().min(2).max(1024),
            // menu_name: Joi.string().min(2).max(1024),
            // menu_price: Joi.number(),
            // images:Joi.string().min(2).max(1024),
        })
    return result = joi_tailor_schema.validate(tailor);
}

const tailor_schema = new mongoose.Schema
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
        experience:
        {
            type: String,
            required: true,
        },
        average_rate_per_stitching: {
            type: Number,
            required: true,
            // enum:[200,500,1000,1500,2000,3000,4000]

        },
        images: [
            {
                type: String,
            },
        ],
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
        }
    })

const Tailor = mongoose.model('Tailor', tailor_schema);
module.exports.Tailor = Tailor;
module.exports.tailor_validation = tailor_validation;

