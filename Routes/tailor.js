const express = require('express');
const Joi = require('joi');
const { tailor_validation, Tailor } = require('../models/tailor');
const router = express.Router();
const upload = require('../multer')
const cloudinary = require('../cloudinary')
const fs = require('fs');

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



function logInValidation(tailor) {
    const tailor_schema = Joi.object
        ({
            email: Joi.string().email().required().min(3).max(120),
            password: Joi.string().min(6).max(30).required(),
        })
    return tailor_schema.validate(tailor)
}

module.exports = router;
