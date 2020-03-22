const mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    }
});

userSchema.statics.auth = function(email,password,callback){
    User.findOne({email:email})
    .exec(function(err,user){
        if (err){
            return callback(err)
        } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        } else {
            if(password === user.password){
                return callback(null, user);
            } else {
                return callback();
            }
        }
    })
};

var User = module.exports = mongoose.model('User', userSchema);