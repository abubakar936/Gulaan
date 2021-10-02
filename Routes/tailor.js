const express = require('express');
const Joi = require('joi');
const { tailor_validation, Tailor } = require('../models/tailor');
const router = express.Router();
const upload = require('../multer')
const cloudinary = require('../cloudinary')
const fs = require('fs');
const { Post } = require('../models/posts');
const { BiddingRequest } = require('../models/bidingRequests');
const { Customization } = require('../models/customization');
const { User } = require('../models/user');

//-----     signup     ------//
router.post('/signup', async (req, res) => {
    const result = tailor_validation(req.body);
    if (result.error != null) {
        return res.json
            ({
                success: false,
                message: (result.error.details[0].message)
            })
    }
    let tailor = await Tailor.findOne({ email: req.body.email });
    if (tailor) {
        return res.json
            ({
                success: false,
                message: "Email alreay registerd",
            })
    }
    try {
        const new_tailor = new Tailor
            ({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                contact: req.body.contact,
                email: req.body.email,
                password: req.body.password,
                city: req.body.city,
                address: req.body.address,
                experience: req.body.experience,
                type_of_tailor: req.body.type_of_tailor,
                average_rate_per_stitching: req.body.average_rate_per_stitching,
                lang: req.body.lang,
                lat: req.body.lat,

            })
        const tailor = await new_tailor.save();
        return res.json
            ({
                success: true,
                message: "Account registered successfully",
            })
    }
    catch (err) {
        return res.json
            ({
                success: false,
                message: err.message,
            })
    }
})
//-----     login      ------//
router.post('/login', async (req, res) => {
    const result = logInValidation(req.body);
    if (result.error != null) {
        return res.json({
            success: false,
            status: 400,
            message: result.error.details[0].message
        })
    }
    try {
        var get_tailor = await Tailor.findOne({
            email: { $regex: "^" + req.body.email, $options: 'i' },
            password: req.body.password
        })
        if (!get_tailor) {
            return res.json
                ({
                    success: false,
                    message: "user or password incorrect....",
                    status: 400
                })
        }
        if (get_tailor) {
            return res.json
                ({
                    success: true,
                    data: get_tailor,
                })
        }
    }
    catch (err) {
        return res.json
            ({
                success: false,
                error: err,
            })
    }
})
//-----  update email    ------//
router.put('/email/:tailor_id', async (req, res) => {
    try {
        const get_tailor = await Tailor.findOneAndUpdate({ _id: req.params.tailor_id },
            {
                email: req.body.email,
            },
            { new: true })
        return res.json
            ({
                success: true,
                data: get_tailor,
            })
    }
    catch (err) {
        return res.status(500).json
            ({
                success: false,
                message: err,
            })
    }

})
//----- upload/update  profile pic ------//
router.put('/profile_Photo/:tailor_id', upload.array('profile_photo'), async (req, res) => {

    const uploader = async (path) => await cloudinary.uploads(path, 'Images');

    const urls = []
    const files = req.files;
    for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path)
        urls.push(newPath)
        fs.unlinkSync(path)
    }
    console.log(urls)
    const url = urls[0].url
    const get_tailor = await Tailor.findOneAndUpdate({ _id: req.params.tailor_id },
        {
            profile_photo: url

        }, { new: true });
    res.status(200).json({
        message: 'images uploaded successfully',
        data: get_tailor
    })
})
//sfh
//----- get complete profile detalis ------//
router.get('/get_profile/:tailor_id', async (req, res) => {
    const get_tailor = await Tailor.findOne({ _id: req.params.tailor_id })
    if (get_tailor == null)
        return res.json
            ({
                success: false,
                error: "Taior does not exist",
            })
    if (get_tailor != null)
        return res.json
            ({
                success: true,
                data: get_tailor,
            })
})



//-----  update contact no    ------//
router.put('/contact/:tailor_id', async (req, res) => {
    try {
        const get_tailor = await Tailor.findOneAndUpdate({ _id: req.params.tailor_id },
            {
                contact: req.body.contact,
            },
            { new: true })
        return res.json
            ({
                success: true,
                data: get_tailor,
            })
    }
    catch (err) {
        return res.status(500).json
            ({
                success: false,
                message: err,
            })
    }
})


//-----  update contact no    ------//
router.put('/update_detils/:tailor_id', /*upload.array('profile_photo'),*/ async (req, res) => {

    // const uploader = async (path) => await cloudinary.uploads(path, 'Images');

    // const urls = []
    // const files = req.files;
    // for (const file of files) {
    //     const { path } = file;
    //     const newPath = await uploader(path)
    //     urls.push(newPath)
    //     fs.unlinkSync(path)
    // }
    // console.log(urls)
    // const url = urls[0].url

    try {
        const get_tailor = await Tailor.findOneAndUpdate({ _id: req.params.tailor_id },
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                password: req.body.password,
                city: req.body.city,
                address: req.body.address,
                contact: req.body.contact,
                experience: req.body.experience,
                average_rate_per_stitching: req.body.average_rate_per_stitching,
                //   profile_photo: req.body.profile_photo

            },
            { new: true })
        return res.json
            ({
                success: true,
                data: get_tailor,
            })
    }
    catch (err) {
        return res.status(500).json
            ({
                success: false,
                message: err,
            })
    }
})

router.get('/get_all_biding/:tailor_id', async (req, res) => {
    var get_biding = await BiddingRequest.find({
        "tailor.tailor_id": req.params.tailor_id,
    })
    if (get_biding.length == 0) {
        return res.json
            ({
                success: false,
                message: "no request yet"
            })
    }
    if (get_biding.length != 0) {
        return res.json
            ({
                success: true,
                data: get_biding,
            })
    }
})




//----- get all tailors ------//
router.get('/get_all_tailors', async (req, res) => {
    try {
        const get_tailor = await Tailor.find()
        if (get_tailor == null)
            return res.json
                ({
                    success: false,
                    error: "NO Tailor exist",
                })
        if (get_tailor != null)
            return res.json
                ({
                    success: true,
                    data: get_tailor,
                })
    }
    catch (err) {
        return res.status(500).json
            ({
                success: false,
                message: err,
            })
    }
})
router.post('/bidingRequest', async (req, res) => {
    var get_biding = await BiddingRequest.findOneAndRemove({
        "user.user_id": req.body.user_id,
        "tailor.tailor_id": req.body.tailor_id,
        "post.post_id": req.body.post_id
    }
    )

    console.log(get_biding)
    if (get_biding) {
        //  var delete_biding = await BiddingRequest.findByIdAndDelete({
        return res.json
            ({
                success: false,
                message: "Biding request deleted",
                status: 400
            })
    }
    var get_tailor = await Tailor.findOne({
        _id: req.body.tailor_id,
    })
    //  console.log(get_tailor)
    if (!get_tailor) {
        return res.json
            ({
                success: false,
                message: "tailor not found",
                status: 404
            })
    }
    var postid = req.body.post_id
    var get_user = await User.findOne({ _id: req.body.user_id })
    //    console.log(get_customizations)
    if (!get_user) {
        return res.json
            ({
                success: false,
                message: "user not found",
                status: 404
            })
    }
    if (req.body.post_id) {
        var get_customizations = await Customization.findOne({ _id: req.body.post_id })
        //    console.log(get_customizations)
        if (!get_customizations) {
            return res.json
                ({
                    success: false,
                    message: "post not found",
                    status: 404
                })
        }
        const new_request = new BiddingRequest
            ({
                user: {
                    user_id: req.body.user_id,
                    first_name: get_user.first_name,
                    last_name: get_user.last_name,
                    email: get_user.email,
                    contact: get_user.contact,
                    city: get_user.city,
                    address: get_user.address,
                    profile_photo: get_user.profile_photo

                },
                post: {
                    post_id: get_customizations._id,
                    post_images: get_customizations.images,
                    post_description: get_customizations.description,
                    post_date: get_customizations.date,
                    length: get_customizations.length,
                    waist: get_customizations.waist,
                    chest: get_customizations.chest,
                    shoulder: get_customizations.shoulder,
                    seleves: get_customizations.seleves,
                },
                tailor: {
                    tailor_id: get_tailor._id,
                    first_name: get_tailor.first_name,
                    last_name: get_tailor.last_name,
                    email: get_tailor.email,
                    contact: get_tailor.contact,
                    city: get_tailor.city,
                    address: get_tailor.address,
                    experience: get_tailor.experience,
                    average_rate_per_stitching: get_tailor.average_rate_per_stitching,
                    images: get_tailor.images,
                    profile_photo: get_tailor.profile_photo
                },
                amount: req.body.amount,
                days: req.body.days,

            })
        const new_bid = await new_request.save();
        return res.json
            ({
                success: true,
                message: "Bidding send ",
                data: new_bid,
            })
    }
    else {
        var get_user = await User.findOne({ _id: req.body.user_id })
        //    console.log(get_customizations)
        if (!get_user) {
            return res.json
                ({
                    success: false,
                    message: "user not found",
                    status: 404
                })
        }
        const new_request = new BiddingRequest
            ({
                user: {
                    user_id: req.body.user_id,
                    first_name: get_user.first_name,
                    last_name: get_user.last_name,
                    email: get_user.email,
                    contact: get_user.contact,
                    city: get_user.city,
                    address: get_user.address,
                    profile_photo: get_user.profile_photo

                },

                tailor: {
                    tailor_id: get_tailor._id,
                    first_name: get_tailor.first_name,
                    last_name: get_tailor.last_name,
                    email: get_tailor.email,
                    contact: get_tailor.contact,
                    city: get_tailor.city,
                    address: get_tailor.address,
                    experience: get_tailor.experience,
                    average_rate_per_stitching: get_tailor.average_rate_per_stitching,
                    images: get_tailor.images,
                    profile_photo: get_tailor.profile_photo
                },


            })
        const new_bid = await new_request.save();
        return res.json
            ({
                success: true,
                message: "Bidding send ",
                data: new_bid,
            })
    }

})

router.put('/stripe_account/:tailor_id', async (req, res) => {

    try {
        const stripe = require('stripe')('sk_test_51IafIsKpjrUzbb0EwWRaMtI4o1raPutioih1FFgJHmkb2eLYcM98eF04Ddb5D3jhgLrncCulnL4L88anxbfpymdf00VI0szXe4');

        const account = await stripe.accounts.create({
            type: 'custom',
            country: 'US',
            email: req.body.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
        const gettailor = await Tailor.findOneAndUpdate({ _id: req.params.tailor_id },
            {
                stripe_account_id: account.id,
            },
            { new: true }
        )
        // console.log(account)
        var accountLink = await stripe.accountLinks.create({
            account: account.id,
            success_url: 'https://www.google.com/',
            failure_url: 'https://www.youtube.com/',
            type: 'custom_account_verification',
            collect: 'eventually_due'
        })


        console.log(accountLink);

        return res.json
            ({
                success: true,
                message: 'Account added successfully click on this ' + accountLink.url + " to add all information of your account",
                // data: gettailor,
                redirect: accountLink.url
            })
    }
    catch (err) {
        return res.status(500).json
            ({
                success: false,
                message: err,
            })
    }
})
router.put('/update_bidding_status/:bidding_id', async (req, res) => {
    if (req.body.status == "accepted") {
        try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            var token = await stripe.tokens.create({
                card: {
                    number: req.body.card_number,
                    exp_month: req.body.exp_month,
                    exp_year: req.body.exp_year,
                    cvc: req.body.cvc,
                },
            });
            //   console.log(token.id)
        }
        catch (err) {
            return res.json({
                success: false,
                message: err.raw.message,
            })
        }
        var get_bidding = await BiddingRequest.findOneAndUpdate({ _id: req.params.bidding_id },
            {
                status: "accepted",
                card_token_id: token.id
            })
        return res.json({
            success: true,
            message: "Request accepted ",

        })

    }
    if (req.body.status == "completed") {
        var get_one_bidding = await BiddingRequest.findOneAndUpdate({ _id: req.params.bidding_id },
            {
                status: "accepted"
            }
        )
        console.log("amount", get_one_bidding.amount)
        console.log("card token id ", get_one_bidding.card_token_id)
        try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const charge = await stripe.charges.create({
                amount: (get_one_bidding.amount) * 100,
                currency: 'usd',
                source: get_one_bidding.card_token_id,
                description: 'Payment done ',
            });
            //  console.log(charge);
        }
        catch (err) {
            return res.json({
                success: false,
                message: err,
            })
        }
        try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

            // Create a PaymentIntent:
            const paymentIntent = await stripe.paymentIntents.create({
                amount: (get_one_bidding.amount) * 100,
                // source: token.id,
                currency: 'usd',
                payment_method_types: ['card'],
                transfer_group: '{ORDER10}',
            });

            // Create a Transfer to the connected account (later):
            var transfer = await stripe.transfers.create({
                amount: ((get_one_bidding.amount * 100) / 100) * 70,
                currency: 'usd',
                destination: "acct_1IuaWn4DizgR8LJx",
                transfer_group: '{ORDER10}',
            });
            console.log(transfer);
        }
        catch (err) {
            return res.json({
                success: false,
                message: err.raw.message,
            })
        }
        return res.json({
            success: true,
            message: "Request completed and payment transfer successfully ",
            transfer_data: transfer
        })

    }
    if (req.body.status == "rejected") {
        var get_bidding = await BiddingRequest.findOneAndRemove({ _id: req.params.bidding_id })
        return res.json({
            success: true,
            message: "bidding request rejected",

        })
    }
})



//-----    post a new trend      ------//
router.post('/trend_upload/:tailor_id', upload.array('images'), async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path, 'Images');
    try {
        var urls = []
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path)
            urls.push(newPath)
            fs.unlinkSync(path)
        }
        var photos = [];
        console.log(urls.length)
        if (urls.length == 0) {
            return res.json
                ({
                    success: false,
                    message: "please upload atleast one image ",
                })

        }
        console.log("this is urls ", urls)
        const url = urls[0].url
        for (var i = 0; i < urls.length; i++) {
            photos.push(urls[i].url)
        }
        console.log(photos)

    } catch (err) {
        console.log(err)
    }


    // const result = posts_validation(req.body);
    // if (result.error != null) {
    //     return res.json({
    //         success: false,
    //         status: 400,
    //         message: result.error.details[0].message
    //     })
    // }
    try {
        var get_tailor = await Tailor.findOne({
            _id: req.params.tailor_id,
        })
        console.log(get_tailor)
        if (!get_tailor) {
            return res.json
                ({
                    success: false,
                    message: "tailor not ound",
                    status: 400
                })
        }
        if (get_tailor) {
            const new_post = new Post
                ({
                    tailor_id: req.params.tailor_id,
                    first_name: get_tailor.first_name,
                    last_name: get_tailor.last_name,
                    description: req.body.description,
                    images: photos,
                    profile_photo: get_tailor.profile_photo,
                    tailor_post: true
                })
            const post = await new_post.save();
            return res.json
                ({
                    success: true,
                    message: "Trend uploaded ",
                    data: post,
                })
        }
    }
    catch (err) {
        return res.json
            ({
                success: false,
                error: err,
            })
    }
})



//----- get complete profile detalis ------//
router.get('/all_posts_by_tailors', async (req, res) => {
    const get_posts = await Post.find({ tailor_post: true })
    if (get_posts.length == 0)
        return res.json
            ({
                success: false,
                error: "No post exist",
            })
    if (get_posts.length > 0)
        return res.json
            ({
                success: true,
                data: get_posts,
            })
})


function logInValidation(tailor) {
    const tailor_schema = Joi.object
        ({
            email: Joi.string().email().required().min(3).max(120),
            password: Joi.string().min(6).max(30).required(),
        })
    return tailor_schema.validate(tailor)
}

module.exports = router;
