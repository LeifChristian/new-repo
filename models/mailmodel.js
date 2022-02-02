var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var mailSchema = new mongoose.Schema({
    sender_email: { type: String },
    sender_id: { type: ObjectId,  required: true },
    sender_networkId: { type: ObjectId,  required: true },
    recipient_email: { type: String},
    recipient_id: { type: ObjectId,  required: true },
    mail_status: { type: String, default: 0},
    is_invitationAccepted: { type: String, default: 0},
    mail_createdDate: { type: Date, default: Date.now },
});

var Mail = module.exports = mongoose.model('Mail', mailSchema);


// send mail to user
module.exports.insvitedUser = function (userdetail, callback) {
    Mail.create(userdetail, callback);
}

// responseOnInvitation
module.exports.responseOnInvitation = function (query, update, callback) {
    Mail.findByIdAndUpdate(query, update, callback);
}

// invited network list
module.exports.networkInvitationList = function (recipient_id, callback) {
   Mail.aggregate( [ {"$match" : { "$and" : [ {recipient_id : mongoose.Types.ObjectId(recipient_id) }, {is_invitationAccepted : '0'} ] } },{ "$lookup": {"localField": "sender_networkId","from": "networks","foreignField": "_id","as": "networkinfo"} },{ "$unwind": "$networkinfo" }], callback);
}

// invited network list
module.exports.acceptdNetworkList = function (recipient_id, callback) {
   Mail.aggregate( [ {"$match" : { "$and" : [ {recipient_id : mongoose.Types.ObjectId(recipient_id) }, {is_invitationAccepted : '1'} ] } },{ "$lookup": {"localField": "sender_networkId","from": "networks","foreignField": "_id","as": "networkinfo"} },{ "$unwind": "$networkinfo" }], callback);
}
