const   mongoose = require("mongoose"),
        passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        require: true
    },
    Facebook: String,
    Twitter: String,
    Instagram: String,
    LinkedIn: String,
    avatar: String,
    description: String,
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);