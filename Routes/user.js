const express = require('express');
const Joi = require('joi');
const { user_validation, User } = require('../models/user')
const router = express.Router();
const upload = require('../multer')
const cloudinary = require('../cloudinary')
const fs = require('fs');
const { Tailor } = require('../models/tailor');

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


//----- get all tailors------//
router.get('/get_all_tailors', async (req, res) => {
    try {
        const get_tailor = await Tailor.find()
        if (get_tailor.length == 0)
            return res.json
                ({
                    success: false,
                    error: "Taior does not exist",
                })
        if (get_tailor.length > 0)
            return res.json
                ({
                    success: true,
                    data: get_tailor,
                })
    }
    catch (err) {
        res.json({
            success: false,
            message: err
        })
    }

})

//-----  add favorite tailor   ------//
router.put('/add_favorite_tailor/:tailor_id/:user_id', async (req, res) => {
    try {
        const get_tailor = await Tailor.findOne({ _id: req.params.tailor_id });
        const favoriate_tailor = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                $push: {
                    favorite_tailors: {
                        tailor_id: get_tailor._id,
                        first_name: get_tailor.first_name,
                        last_name: get_tailor.last_name,
                        city: get_tailor.city,
                        type_of_tailor: get_tailor.type_of_tailor
                    }
                }
            },
            { new: true })

        return res.json
            ({
                success: true,
                message: "tailor added successfully",
                data: favoriate_tailor,
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

//-----  remove favorite tailor   ------//
router.put('/remove_favorite_tailor/:tailor_id/:tailor_id', async (req, res) => {
    try {
        const get_tailor = await Tailor.findOne({ _id: req.params.tailor_id });
        const favoriate_tailor = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                $pull: {
                    favorite_tailors: {
                        tailor_id: get_tailor._id,
                    }
                }
            },
            { new: true })

        return res.json
            ({
                success: true,
                message: "tailor removed successfully",
                data: favoriate_tailor,
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

//----- get all  favorite tailors------//
router.get('/get_all_favorite_tailors/:user_id', async (req, res) => {
    try {
        const get_favorite_tailors = await User.find({ _id: req.params.user_id })
            .select({ favorite_tailors: 1, _id: 0 })
        if (get_favorite_tailors == null)
            return res.json
                ({
                    success: false,
                    error: "No tailor in favorite list",
                })
        if (get_favorite_tailors != null)
            return res.json
                ({
                    success: true,
                    data: get_favorite_tailors,
                })
    }
    catch (err) {
        res.json({
            success: false,
            message: "server error"
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
