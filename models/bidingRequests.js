const mongoose = require('mongoose');

const bidingRequest_schema = new mongoose.Schema
    ({
        user: new mongoose.Schema({
            user_id: {
                type: mongoose.Schema.Types.ObjectId
            },
            first_name:
            {
                type: String,

            },
            last_name:
            {
                type: String,

            },
            email:
            {
                type: String,

            },
            contact:
            {
                type: Number,
            },
            city:
            {
                type: String,

            },
            address:
            {
                type: String,

            },

            profile_photo: {
                type: String,
                default: "http://res.cloudinary.com/dnfelxq6z/image/upload/v1621159792/Images/og3wxp1zfrei6pdzhfri.png"
            },
        }),
        post: new mongoose.Schema({
            post_id: {
                type: mongoose.Schema.Types.ObjectId
            },
            post_images: {
                type: Array,
            },
            post_description: {
                type: String,

            },
            post_date: {
                type: Date,

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
        }),
        tailor: new mongoose.Schema({
            tailor_id: {
                type: mongoose.Schema.Types.ObjectId
            },
            first_name:
            {
                type: String,

            },
            last_name:
            {
                type: String,

            },
            email:
            {
                type: String,

            },
            contact:
            {
                type: Number,
            },
            city:
            {
                type: String,

            },
            address:
            {
                type: String,

            },
            experience:
            {
                type: String,

            },
            average_rate_per_stitching: {
                type: Number,

            },
            images: [
                {
                    type: String,
                },
            ],
            profile_photo: {
                type: String,
                default: "http://res.cloudinary.com/dnfelxq6z/image/upload/v1621159792/Images/og3wxp1zfrei6pdzhfri.png"
            },
        }),
        amount: {
            type: Number,

        },
        days: {
            type: Number,

        },
        status: {
            type: String,
            default: "pending"
        },
        card_token_id: {
            type: String,

        }
    })

const BiddingRequest = mongoose.model('BiddingRequest', bidingRequest_schema);
module.exports.BiddingRequest = BiddingRequest;
//module.exports.posts_validation = posts_validation;

