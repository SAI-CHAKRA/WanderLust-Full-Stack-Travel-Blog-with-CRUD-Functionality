const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

// we don't need to created a password and username field in userSchema because passport-local-mongoose will add it automatically with salting and hashing
// we just use plugin method to add passport-local-mongoose to our schema

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);
