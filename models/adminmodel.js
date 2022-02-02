var mongoose = require('mongoose');

var adminSchema = new mongoose.Schema({
    admin_email: { type: String },
    admin_password: { type: String },
    admin_role: { type: String, default: 2},
    admin_name: { type: String },
    admin_status: { type: String, default: 1},
    admin_createdDate: { type: Date, default: Date.now },
});

var Admin = module.exports = mongoose.model('Admin', adminSchema);


 // admin login
module.exports.login = function (query, callback) {
    Admin.find(query, callback);
}

// subadmin list
module.exports.subadminList = function (query, callback) {
    Admin.find(query, callback).sort({ _id : -1 });
}

// add subadmin
module.exports.addSubadmin = function (userdetail, callback) {
    Admin.create(userdetail, callback);
}

// check user exits or not
module.exports.checkUserExist = function (query, callback) {
    Admin.find(query, callback);
}

// changePassword
module.exports.changePassword = function (query, update, callback) {
    Admin.findByIdAndUpdate(query, update, callback);
}

// admin active or inctive
module.exports.adminChangeStatus = function (query, update, callback) {
    Admin.findByIdAndUpdate(query, update, callback);
}

// get subadmin detail
module.exports.getSubadminDetail = function (query, callback) {
    Admin.find(query, callback);
}

// updateSubadmin
module.exports.updateSubadmin = function (query, update, callback) {
    Admin.findByIdAndUpdate(query, update, callback);
}
