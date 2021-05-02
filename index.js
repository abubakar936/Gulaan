const express = require('express');
const cors = require('cors');
const app = express();
const tailor = require('./Routes/tailor');
const user = require('./Routes/user');


var corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200 // For legacy browser support
}
app.use(cors(corsOptions));
app.use(express.json());


app.use('/api/tailor', tailor);
app.use('/api/user', user);

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Gulaan",
    { useNewUrlParser: true },
    { useUnifiedTopology: true })
    .then(() => console.log("Connected to Gulaan...."))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.listen(8080, () => {
    console.log("listening on port no 8080");
})
