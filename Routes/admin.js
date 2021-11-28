const express = require('express');
const Joi = require('joi');

const { user_validation, User } = require('../models/user')
const { tailor_validation, Tailor } = require('../models/tailor');
const router = express.Router();
const upload = require('../multer')
const cloudinary = require('../cloudinary')
const fs = require('fs');
const { Post } = require('../models/posts');
const { Customization } = require('../models/customization');

//-----     signup     ------//
router.post('/addtailor', async (req, res) => {
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
            email_varification: true
        })
    const savetailor = await new_tailor.save();
    return res.json
        ({
            success: true,
            message: "Account registered successfully",
            data: savetailor
        })
})
router.get('/tailordetail/:tailor_id', async (req, res) => {
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
router.put('/update_detils/:tailor_id', /*upload.array('profile_photo'),*/ async (req, res) => {
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

router.post('/adduser', async (req, res) => {
    const result = user_validation(req.body);
    if (result.error != null) {
        return res.json
            ({
                success: false,
                message: (result.error.details[0].message)
            })
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.json
            ({
                success: false,
                message: "Email alreay registerd",
            })
    }
    try {
        const new_user = new User
            ({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                contact: req.body.contact,
                email: req.body.email,
                password: req.body.password,
                city: req.body.city,
                address: req.body.address,
                email_varification: true
            })
        const user = await new_user.save();
        return res.json
            ({
                success: true,
                message: "Account registered successfully",
                dara: user
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

router.put('/profile_Photo/:user_id', upload.array('profile_photo'), async (req, res) => {

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
    const get_user = await User.findOneAndUpdate({ _id: req.params.user_id },
        {
            profile_photo: url

        }, { new: true });
    res.status(200).json({
        message: 'images uploaded successfully',
        data: get_user
    })
})

router.put('/update_detils/:user_id', /*upload.array('profile_photo'), */async (req, res) => {
    try {
        const get_user = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                password: req.body.password,
                city: req.body.city,
                address: req.body.address,
                contact: req.body.contact,
                //       profile_photo: req.body.profile_photo
            },
            { new: true })
        return res.json
            ({
                success: true,
                data: get_user,
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

router.get('/all_posts', async (req, res) => {
    const get_posts = await Post.find({})
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

router.get('/all_customization', async (req, res) => {
    const get_customization = await Customization.find({})
    if (get_customization.length == 0)
        return res.json
            ({
                success: false,
                error: "No customizated dress  exist",
            })
    if (get_customization.length > 0)
        return res.json
            ({
                success: true,
                data: get_customization,
            })
})


module.exports = router;
