const express = require('express');
const cors = require('cors');
const app = express();
const tailor = require('./Routes/tailor');
const user = require('./Routes/user');
const admin = require('./Routes/admin');


var corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200 // For legacy browser support
}
app.set('view engine', 'ejs');
// app.use('/uploads', express.static('/uploads'));
// app.use(express.static(__dirname));
app.use(cors(corsOptions));
app.use(express.json());
// var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/uploads'));

app.use('/api/tailor', tailor);
app.use('/api/user', user);

app.use('/api/admin', admin);
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Abubakar:DfohKvcRnMz7UOjm@cluster0.z1hqb.mongodb.net/Gulaan",
    { useNewUrlParser: true },
    { useUnifiedTopology: true })
    .then(() => console.log("Connected to Gulaan...."))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.send("Welcome to Gulaan.....s")
    // res.render('index');
})



app.listen(process.env.PORT || 8080, () => {
    console.log("listening on port no 8080");
})
