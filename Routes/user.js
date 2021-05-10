const express = require('express');
const Joi = require('joi');
const { user_validation, User } = require('../models/user')
const router = express.Router();
const upload = require('../multer')
const cloudinary = require('../cloudinary')
const fs = require('fs');
const { Tailor } = require('../models/tailor');
const { posts_validation, Post } = require('../models/posts');
const { post } = require('./tailor');

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
router.put('/remove_favorite_tailor/:tailor_id/:user_id', async (req, res) => {
    try {
        //  const get_tailor = await Tailor.findOne({ _id: req.params.tailor_id });
        const favoriate_tailor = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                $pull: {
                    favorite_tailors: {
                        tailor_id: req.params.tailor_id,
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

//-----  update everything no    ------//
router.put('/update_detils/:user_id', async (req, res) => {
    try {
        const get_user = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                password: req.body.password,
                city: req.body.city,
                address: req.body.address,
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


//-----    post a new trend      ------//
router.post('/trend_upload/:user_id', upload.array('images'), async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path, 'Images');
    var urls = []
    const files = req.files;
    for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path)
        urls.push(newPath)
        fs.unlinkSync(path)
        console.log(__dirname);
    }
    var photos = [];
    console.log(photos)
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


    // const result = posts_validation(req.body);
    // if (result.error != null) {
    //     return res.json({
    //         success: false,
    //         status: 400,
    //         message: result.error.details[0].message
    //     })
    // }
    try {
        var get_user = await User.findOne({
            _id: req.params.user_id,
        })
        if (!get_user) {
            return res.json
                ({
                    success: false,
                    message: "user not ound",
                    status: 400
                })
        }
        if (get_user) {
            const new_post = new Post
                ({
                    user_id: req.params.user_id,
                    first_name: get_user.first_name,
                    last_name: get_user.last_name,
                    description: req.body.description,
                    images: photos
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

//-----  update contact no    ------//
router.put('/update_post/:post_id/:user_id', upload.array('images'), async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path, 'Images');
    var urls = []
    const files = req.files;
    for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path)
        urls.push(newPath)
        fs.unlinkSync(path)
    }
    var photos = [];
    console.log(urls)
    const url = urls[0].url
    for (var i = 0; i < urls.length; i++) {
        photos.push(urls[i].url)
    }
    console.log(photos)

    try {
        const get_post = await Post.findOneAndUpdate({
            _id: req.params.post_id,
            user_id: req.params.user_id
        },
            {
                description: req.body.description,
                images: photos,
                updated: true
            },
            { new: true })
        return res.json
            ({
                success: true,
                data: get_post,
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


//----- get complete profile detalis ------//
router.get('/all_posts_of_user/:user_id', async (req, res) => {
    const get_posts = await Post.find({ user_id: req.params.user_id })
    if (get_posts.length == 0)
        return res.json
            ({
                success: false,
                error: "No post by this user",
            })
    if (get_posts.length > 0)
        return res.json
            ({
                success: true,
                data: get_posts,
            })
})

//----- get complete profile detalis ------//
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


//----- get complete profile detalis ------//
router.get('/all_favorite_posts/:user_id', async (req, res) => {
    const get_posts = await User.find({ _id: req.params.user_id }).select(
        {
            favorite_posts: 1
        }
    )
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



//-----  add favorite tailor   ------//
router.put('/add_favorite_post/:post_id/:user_id', async (req, res) => {
    try {
        const get_post = await Post.findOne({ _id: req.params.post_id });
        console.log(get_post.user_id)

        const favoriate_post = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                $push: {
                    favorite_posts: {
                        post_id: req.params.post_id,
                        user_id: get_post.user_id,
                        first_name: get_post.first_name,
                        last_name: get_post.last_name,
                        images: get_post.images,
                        description: get_post.description,
                        date: get_post.date,
                    }
                }
            },
            { new: true }).select({ favorite_posts: 1 })

        return res.json
            ({
                success: true,
                message: "Post added in favorite successfully",
                data: favoriate_post,
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
router.put('/remove_favorite_post/:post_id/:user_id', async (req, res) => {
    try {
        // const get_favoriate_tailor = await User.findOne({ _id: req.params.user_id, post_id: req.params.post_id })
        // if (get_favoriate_tailor == null) {
        //     return res.json
        //         ({
        //             success: false,
        //             message: "Post does not exist in favorite list",
        //         })

        // }

        const favorite_posts = await User.findOneAndUpdate({ _id: req.params.user_id },
            {
                $pull: {
                    favorite_posts: {
                        post_id: req.params.post_id,
                    }
                }
            },
            { new: true })

        return res.json
            ({
                success: true,
                message: "tailor removed successfully",
                data: favorite_posts,
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
