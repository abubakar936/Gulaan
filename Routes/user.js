const express = require('express');
const Joi = require('joi');
const { user_validation, User } = require('../Models/user');
const router = express.Router();
const upload = require('../multer')
const cloudinary = require('../cloudinary')
const fs = require('fs');

//-----     signup     ------//
router.post('/signup', async (req, res) => {
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
            })
        const user = await new_user.save();
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
        var get_user = await User.findOne({
            email: { $regex: "^" + req.body.email, $options: 'i' },
            password: req.body.password
        })
        if (!get_user) {
            return res.json
                ({
                    success: false,
                    message: "user or password incorrect....",
                    status: 400
                })
        }
        if (get_user) {
            return res.json
                ({
                    success: true,
                    data: get_user,
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
router.put('/email/:user_id', async (req, res) => {
    try {
        const get_user = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                email: req.body.email,
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
//----- upload/update  profile pic ------//
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
//----- get complete profile detalis ------//
router.get('/get_profile/:user_id', async (req, res) => {
    const get_user = await User.findOne({ _id: req.params.user_id })
    if (get_user == null)
        return res.json
            ({
                success: false,
                error: "user does not exist",
            })
    if (get_user != null)
        return res.json
            ({
                success: true,
                data: get_user,
            })
})
//-----  update contact no    ------//
router.put('/contact/:user_id', async (req, res) => {
    try {
        const get_user = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                contact: req.body.contact,
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



function logInValidation(user) {
    const user_schema = Joi.object
        ({
            email: Joi.string().email().required().min(3).max(120),
            password: Joi.string().min(6).max(30).required(),
        })
    return user_schema.validate(user)
}

module.exports = router;
