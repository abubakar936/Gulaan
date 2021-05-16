const mongoose = require('mongoose');
const Joi = require('joi');

// function customization_validation(post) {
//     const joi_posts_schema = Joi.object
//         ({
//             // user_id: Joi.string().required().min(3).max(120),
//             first_name: Joi.string().required().min(3).max(120),
//             last_name: Joi.string().required().min(3).max(120),
//             images: Joi.array().min(2).max(1024),
//             //  description:Joi.string(),
//         })
//     return result = joi_posts_schema.validate(post);
// }

const customization_schema = new mongoose.Schema
    ({
        user_id: {
            type: mongoose.Schema.Types.ObjectId
        },
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
        images: {
            type: Array,
        },
        description: {
            type: String,
            default: ""
        },
        updated: {
            type: Boolean,
            default: false
        },
        profile_photo: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now()
        },
        length:
        {
            type: String
        },
        waist:
        {
            type: String
        },
        chest:
        {
            type: String
        },
        shoulder:
        {
            type: String
        },
        seleves:
        {
            type: String
        },
    })

const Customization = mongoose.model('Customization', customization_schema);
module.exports.Customization = Customization;
//module.exports.posts_validation = posts_validation;

