var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var inviteSchema = new mongoose.Schema({
    invite_from: { type: ObjectId,  required: true },
    invite_to: { type: ObjectId },
    network_id: { type: ObjectId,  required: true },
    phone: { type: String},
    email: { type: String},
    is_invitationAccepted: { type: String, default: 0},
    is_user_admin: { type: String, default: 0},
    invitation_dateTime: { type: Date, default: Date.now },
});

var Invite = module.exports = mongoose.model('Invite', inviteSchema);

// check invitation already send
module.exports.checkInvitation = function (query, callback) {
    Invite.findOne(query, callback);
}

// invite user
module.exports.inviteUser = function (userdetail, callback) {
    Invite.create(userdetail, callback);
}

// joined network list
module.exports.getjoinedNetwork = function (user_id, callback) {
   Invite.aggregate( [ {"$match" : { "$and" : [ {invite_to : mongoose.Types.ObjectId(user_id) }, {is_invitationAccepted : '1'}, { invite_from: { $ne: mongoose.Types.ObjectId(user_id) } } ] } },{ "$lookup": {"localField": "network_id","from": "networks","foreignField": "_id","as": "networkinfo"} },{ "$unwind": "$networkinfo" }], callback);
}

// invited network list
module.exports.networkInvitationList = function (invite_to, callback) {
     Invite.aggregate( [ {"$match" : { "$and" : [ {invite_to : mongoose.Types.ObjectId(invite_to) }, {is_invitationAccepted : '0'} ] } },{ "$lookup": {"localField": "network_id","from": "networks","foreignField": "_id","as": "networkinfo"} },{ "$unwind": "$networkinfo" }], callback);
}

// responseOnInvitation
module.exports.responseOnInvitation = function (query, update, callback) {
    Invite.findByIdAndUpdate(query, update, callback);
}

// remove invitation
module.exports.removeInvitation = function (query, callback) {
    Invite.remove(query, callback);
}

// responseOnInvitation
module.exports.updateUserInInvite = function (query, update, callback) {
    Invite.update(query, update, callback);
}

// get all user that joined network
module.exports.joinedNetworkUser = function (invite_from,network_id, callback) {
   Invite.aggregate([{"$match" : { "$and" : [ {network_id : mongoose.Types.ObjectId(network_id) }, {is_invitationAccepted : '1'} ] } },{ "$lookup": {"localField": "invite_to","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" }], callback);
}

// remove member
module.exports.deleteNetworkMember = function (query, callback) {
    Invite.remove(query, callback);
}

// get all user that joined network
module.exports.joinedNetworkUser2 = function (network_id, callback) {
   Invite.aggregate([{"$match" : { "$and" : [ {network_id : mongoose.Types.ObjectId(network_id) }, {is_invitationAccepted : '1'} ] } },{ "$lookup": {"localField": "invite_to","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" }], callback);
}

// make user as a admin
module.exports.makeNetworkAdmin = function (query, update, callback) {
    Invite.findByIdAndUpdate(query, update, callback);
}
