var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    user_name: { type: String },
    user_email: { type: String },
    user_phone: { type: String },
    user_password: { type: String },
    user_pic: { type: String },
    user_devicetype: { type: String },
    user_devicetoken: { type: String },
    user_lat: { type: String },
    user_long: { type: String },
    user_status: { type: String, default: '0'},
    user_otp: { type: String },
    forgot_password : {},
    social_id: { type: String },
    user_loginType: { type: String, default: 1},
    user_otpStatus: { type: String, default: '0' },
    user_otpCreatedDateTime: { type: Date },
    user_otpExpiryDateTime: { type: Date },
    user_notificationStatus: { type: String },
    user_createdDate: { type: Date, default: Date.now },
    user_lastUpdate: { type: Date, default: Date.now }
});

var Users = module.exports = mongoose.model('Users', userSchema);


//  get country list
var countrySchema = new mongoose.Schema({
    name: { type: String },
    dial_code: { type: String },
    code: { type: String }
});
var country = module.exports = mongoose.model('country', countrySchema);

module.exports.getUsers = function (callback, limit) {
    Users.find(callback).sort({ _id : -1 }).limit(limit);
}

// check user detail
module.exports.getUsersDetail = function (query, callback) {
    Users.findOne(query, callback);
}


// check user exits or not
module.exports.checkUserExist = function (query, callback) {
    Users.findOne(query, callback);
}


// send otp
module.exports.sendOtp = function (otpDetail, callback) {
    Users.create(otpDetail, callback);
}

// match otp
module.exports.matchOtp = function (query, callback) {
    Users.findOne(query, callback);
}

// update otp status
module.exports.updateOtpStatus = function (query, update, callback) {
    Users.findByIdAndUpdate(query, update, callback);
}

module.exports.addUser = function (userdetail, callback) {
    Users.create(userdetail, callback);
}


// create password
module.exports.createPassword = function (query, update, option, callback) {
    Users.findByIdAndUpdate(query, update, option, callback);
}


// user login
module.exports.login = function (query, callback) {
    Users.findOne(query, callback);
}

// social login
module.exports.socialLogin = function (userdetail, callback) {
    Users.create(userdetail, callback);
}


// user active or inctive
module.exports.userChangeStatus = function (query, update, callback) {
    Users.findByIdAndUpdate(query, update, callback);
}


// update profile
module.exports.userUpdateProfile = function (query, update, option, callback) {
    Users.findByIdAndUpdate(query, update, option, callback);
}


// update status
module.exports.updatesocialdata = function (query, update, callback) {
    Users.update(query, update, callback);
}

// remove user that is not verified
module.exports.removeNumberIfNotVerified = function (query, callback) {
    Users.remove(query, callback);
}

// get country list
module.exports.getCountry = function (callback, limit) {
    country.find(callback).sort({ _id : +1 }).limit(limit);
}
