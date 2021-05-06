const mongoose = require('mongoose');
const Joi = require('joi');

function posts_validation(post) {
    const joi_posts_schema = Joi.object
        ({
            // user_id: Joi.string().required().min(3).max(120),
            first_name: Joi.string().required().min(3).max(120),
            last_name: Joi.string().required().min(3).max(120),
            images: Joi.array().min(2).max(1024),
            //  description:Joi.string(),
        })
    return result = joi_posts_schema.validate(post);
}

const posts_schema = new mongoose.Schema
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
        date: {
            type: Date,
            default: Date.now()
        }
    })

const Post = mongoose.model('Post', posts_schema);
module.exports.Post = Post;
module.exports.posts_validation = posts_validation;

