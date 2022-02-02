var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var deskPostSchema = new mongoose.Schema({
    network_id: { type: ObjectId },
    post_id: { type: ObjectId },
    location_id: { type: String },
    location_name:{  type: String},
    user_id: { type: ObjectId,  required: true },
    desk_type: { type: String, default: 1 },  // for post
    deskPost_createdDate: { type: Date, default: Date.now },
});

var deskLocationSchema = new mongoose.Schema({
    user_id :{ type: ObjectId,  required: true },
    location :{ type: []},
    network_id : {type: ObjectId}
    // email : { type: String },
    // phone : { type: String },
    // details : { type: String },
    // address :{ type: String },
    // name: { type: String } 
});

var deskLocation = module.exports = mongoose.model('desklocation', deskLocationSchema);
var deskPost = module.exports = mongoose.model('deskPost', deskPostSchema);

// desk post list
module.exports.getDeskPostList = function (query, callback) {
    deskPost.find(query, callback).sort({ _id : -1 });
}

// add desk post
module.exports.saveAsDesk = function (postDesk, callback) {
    deskPost.create(postDesk, callback);
}

// check post already desk or not
module.exports.alreadyDesk = function (query, callback) {
    deskPost.find(query, callback);
}

// check user desk this post or not
module.exports.isUserDeskedThisPost = function (query, callback) {
    deskPost.find(query, callback);
}

// delete desk post
module.exports.removeDeskPost = function (query, callback) {
    deskPost.deleteOne(query, callback);
}

// save location in desk
module.exports.saveLocationAsDesk = function (locationData, callback) {
    deskPost.create(locationData, callback);
}
