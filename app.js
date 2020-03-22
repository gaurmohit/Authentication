const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
require('dotenv').config()

//making db connection
let db_uri = process.env.DB_URI 
mongoose.connect(db_uri);
const db = mongoose.connection;

//check the connection
db.once('connected to mongoDB', function(err){
    console.log(err);
});

//check for db error
db.on('error', function(err){
    console.log(err);
});

//INIT app
const app = express();

//session management
app.use(expressSession({
    secret: 'your secret',
    saveUninitialized: true,
    resave: false
}));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

//bringing in models
let User = require('./models/user.js');
let FailAttempts = require('./models/failedAttempts.js');

//route file
app.use('/',require('./router/route.js'));

//load view
app.set('views', path.join(__dirname, '/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// This will handle 404 requests.
app.use("*",function(req,res) {
    res.status(404).send("404");
  });  

let port = process.env.PORT || 3000
//start server
app.listen(port, function(req,res){
    console.log("listening on the port ", port);
});
