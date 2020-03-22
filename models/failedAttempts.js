const mongoose = require('mongoose');

var failAttSchema = mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    count: {
        type: Number,
        required: true,
        trim: true,
    },
});

failAttSchema.statics.checkIp = function(ip,callback){
    FailAttempts.findOne({'ip': ip})
    .exec(function(err,failRecord){
        if(err){
            return callback(err,null);
        } else{
            console.log(failRecord);
            return callback(null, failRecord);
        }
    });
}

var FailAttempts = module.exports = mongoose.model('FailAttempts', failAttSchema);