var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// network_group collection
var networkGroupSchema = new mongoose.Schema({
    networkGroupNetwork_id: { type: ObjectId,  required: true  },
    networkGroup_status: { type: String, default: 1},
    networkGroup_createdDateTime: { type: Date, default: Date.now },
});

var networkGroup = module.exports = mongoose.model('networkGroup', networkGroupSchema);


// create collection for group member
var networkGroupMemberSchema = new mongoose.Schema({
    networkGroup_id: { type: ObjectId,  required: true },
    networkGroupUser_id: { type: ObjectId,  required: true },
});
var networkGroupMember = module.exports = mongoose.model('networkGroupMember', networkGroupMemberSchema);




// create group
module.exports.createGroup = function (groupRequestData, callback) {
    networkGroup.create(groupRequestData, callback);
}

// add group member
module.exports.addGroupMember = function (groupmember, callback) {
    networkGroupMember.create(groupmember, callback);
}

// get all group
module.exports.getGroup = function (network_id, callback) {
   networkGroup.aggregate( [ { "$sort" : {_id : -1}  }, {"$match" : {networkGroupNetwork_id : mongoose.Types.ObjectId(network_id) } } ], callback);
}


// get group member
module.exports.getGroupMember = function (networkGroup_id, callback) {
   networkGroupMember.aggregate( [ { "$sort" : {_id : -1}  }, {"$match" : {networkGroup_id : mongoose.Types.ObjectId(networkGroup_id) } },{ "$lookup": {"localField": "networkGroupUser_id","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" } ], callback);
}


// get all group
module.exports.getGroupDetail = function (network_id, group_id, callback) {
   networkGroup.aggregate( [ { "$sort" : {_id : -1}  }, {"$match" : {networkGroupNetwork_id : mongoose.Types.ObjectId(network_id), _id : mongoose.Types.ObjectId(group_id) } } ], callback);
}
