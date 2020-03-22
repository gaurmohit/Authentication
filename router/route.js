const express = require('express');
const router = express.Router();
var request = require('request');

//bringing in models
let User = require('../models/user.js');
let FailAttempts = require('../models/failedAttempts.js');


//home page
router.get('/', function(req,res){
  res.render('index.html');
});

//registeration page
router.get('/register', function(req,res){
  res.render('register.html');
});

//login page
router.get('/login', function(req,res){
  res.render('login.html', {'show_error': false});
});

//sign up
router.post('/',function(req,res){
  name = req.body.name;
  email = req.body.email;
  password = req.body.password;
  passwordconf = req.body.passwordconf;
  
  if(name&&
    password&&
    email&&
    passwordconf){
        // confirm that user typed same password twice
    if (password !== passwordconf) {
        console.log("passwords do not match");
        return res.redirect('/register');
    }
    var newUser = new User({
        name: name,
        email: email,
        password: password
    });

    User.create(newUser,function(err,user){
        if(err){
          console.log(err);
          return;
        } else{
          FailAttempts.deleteMany({ip: req.connection.remoteAddress}, function (err) {
            if(err){
              console.log("Error in deleting "+err);
            }
          });
          req.session.userId = user._id;
          console.log('You have registered successfully');
          res.redirect('/login');
      }
    });
  } else {
    res.send({message: 'All fields required.',status:400});
    return res.redirect('/register');  
  }
});

router.get('/profile', function(req,res){
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      console.log("--------------------------------", error)
    }
    if (user === null) {
      return res.render('login.html', {show_error: true, msg: "User does not exist"});
    } else {
      return res.send('<h1>Name: </h1>' + user.name + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
    }
  });
});

// GET for logout logout
router.get('/logout', function (req, res) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/show_captcha', function(req, res) {
  console.log("inside show captcha")
  FailAttempts.checkIp(req.connection.remoteAddress, function(err, failRecord) {
    if(err || !failRecord) {
      //append the new attempt in db
      console.log(" ================= inside if ")
      res.json({'status': false})
    } 
    else {
      //check for whether attempts are less then 3 
      console.log("====== inside else "+failRecord);
      if(failRecord.count<=2){
        res.json({'status': false})
      } else {
        //show captcha
        res.json({'status': true})
      }
    }
  });
});

function handle_ip_check(req) {
  FailAttempts.checkIp(req.connection.remoteAddress, function(err, failRecord) {
    if(failRecord) {
      failRecord.count = failRecord.count + 1;
      failRecord.save()
    } 
    else {

      //create instace 
      var newFailAttempt = new FailAttempts({
        ip: req.connection.remoteAddress,
        count: 1,
      });

      //append the new attempt in db
      FailAttempts.create(newFailAttempt, function(er){
        if(er){
          console.log(er);
        }
      });
    }
  });
}

router.post('/authenticate', function(req, res) {
  console.log("authenticate ==============")
  let { email, password, use_captcha } = req.body;
  console.log("use captcha ===============", req.body)

  if (use_captcha == 'true') {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      handle_ip_check(req);
      return res.render('login.html', {show_error: true, msg: "captcha not selected"});
    }
    // Put your secret key here.
    var secretKey = process.env.SECRET_KEY_CAPTCHA;
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl,function(error,response,body) {
      body = JSON.parse(body);
      // Success will be true or false depending upon captcha validation.
      if(body.success !== undefined && !body.success) {
        handle_ip_check(req);
        return res.render('login.html', {show_error: true, msg: "captcha failed"});
      }
    });
  }

  User.auth(email, password, function(error, user) {
    if (error) {
      console.log(error);
    }
    if (user) {
      console.log('user present in db');
      FailAttempts.deleteMany({ip: req.connection.remoteAddress}, function (err) {
        console.log("Error in deleting "+err);
      });
      req.session.userId = user._id;
      return res.redirect('/profile')
    } else {
      handle_ip_check(req);
      return res.render('login.html', {show_error: true, msg: "username, password does not match"});
    }
  });
  
});

module.exports = router;