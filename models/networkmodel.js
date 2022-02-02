﻿var mongoose = require('mongoose');

 var ObjectId = mongoose.Schema.Types.ObjectId;
// user_id: { type: ObjectId,  required: true },

var networkSchema = new mongoose.Schema({
    networkName: { type: String,  required: true },
    user_id: { type: ObjectId,  required: true },
    inviteVideo: { type: String },
    coverPhoto: { type: String },
    isTaskEnable: { type: Number, Default : 1, min: 0, max: 1},
    media: { type: [] },
    location: { type: []},
    saveAsDesk:{type:Boolean,default:false},
    calendar: { type: [] },
    facebook: { type: [] },
    phone: { type: [] },
    email: { type: [] },
    groupInviteLink: { type: String },
    network_status: { type: String, default: 0},
    created_date: { type: Date, default: Date.now }
});


var Network = module.exports = mongoose.model('Network', networkSchema);

// get all network
// module.exports.allNetwork = function (callback) {
//     Network.find(callback).sort({ _id : -1 });
// }
//
module.exports.allNetwork = function (callback) {
   Network.aggregate([{ "$limit": 20 },{ "$lookup": {"localField": "user_id","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" }], callback);
}
// get network according to id
module.exports.getNetwork = function (query, callback) {
    Network.find(query, callback).sort({ _id : -1 });
}

// create network
module.exports.createNetwork = function (network, callback) {
    Network.create(network, callback);
}

// check network exist
module.exports.checkNetworkExist = function (query, callback) {
    Network.findOne(query, callback);
}

// change status
module.exports.networkChangeStatus = function (query, update, callback) {
   Network.findByIdAndUpdate(query, update, callback);
}

// get network detail
module.exports.networkDetail = function (query, callback) {
    Network.findOne(query, callback);
}

// change status
module.exports.netWorkUpdate = function (query, update, callback) {
   Network.findByIdAndUpdate(query, update, callback);
}

// check network location exist
module.exports.checkNetworkLocation = function (query, callback) {
    Network.find(query, callback);
}

// delete network
module.exports.removeNetwork = function (query, callback) {
    Network.remove(query, callback);
}

// check calendar title exist or not
module.exports.checkCalendarExist = function (query, callback) {
    Network.find(query, callback);
}

// get all network location
module.exports.getAllLocation = function (query, projection, callback) {
    Network.find(query, projection, callback).sort({ "location._id" : -1 });;
}

// get all network media
module.exports.getAllMedia = function (query, projection, callback) {
    Network.find(query, projection, callback);
}

// get all network calendar
module.exports.getAllCalendar = function (query, projection, callback) {
    Network.find(query, projection, callback);
}


// network setting
module.exports.networkSetting = function (query, update, option, callback) {
   Network.findByIdAndUpdate(query, update, option, callback);
}

// get location basis on network detail
module.exports.getSingleLocation = function (networkId, locationId, callback) {
   // console.log("ID",l)
    Network.find({ _id :  mongoose.Types.ObjectId(networkId) },  { location: { $elemMatch: { _id :  locationId } } }, callback);
}
module.exports.getDeskLocation = function (networkId, callback) {
    // console.log("ID",l)
    Network.aggregate([
        {
            $match:{"_id":networkId}
        },
        {
            $unwind:"$location"
        },
        {
            $match:{"location.saveAsDesk":true}
        },
        {
            $group:{"_id":{"Location":"$location"}}
        }
        ],callback)
 }

