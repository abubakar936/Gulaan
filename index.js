const express = require('express');
const cors = require('cors');
const app = express();
const tailor = require('./Routes/tailor');
const user = require('./Routes/user');


var corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200 // For legacy browser support
}
app.set('view engine', 'ejs');
app.use(cors(corsOptions));
app.use(express.json());
// var port = process.env.PORT || 8080;
app.use(express.static(__dirname + '/public'));
app.use('/api/tailor', tailor);
app.use('/api/user', user);

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Gulaan",
    { useNewUrlParser: true },
    { useUnifiedTopology: true })
    .then(() => console.log("Connected to Gulaan...."))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.send("hello world!")
    // res.render('index');
})



app.listen(8080, () => {
    console.log("listening on port no 8080");
})
