require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const path = require('path')

const app = express();
app.use(express.json());

// connect MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
}).then(x => {
    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => {
        console.log(`App with DB ${x.connections[0].name} is Listening on PORT ${PORT}`);
    })
}).catch(err => {
    console.log("Error connecting to Mongo:", err);
});

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(require('node-sass-middleware')({
    src:  path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true
}));

app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000']
}))

// routes middleware:
const index = require('./routes/index');
app.use('/', index);
const auth = require('./routes/auth-routes');
app.use('/auth', auth);