var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// task collection
var networkMediaSchema = new mongoose.Schema({
    isAddDesk:{ type:Boolean,default:false},
    networkMedia_networkId: { type: ObjectId,  required: false  },
    networkMedia_userId: { type: ObjectId,  required: true  },
    networkMedia_OriginalFileName: { type: String, required: true },
    networkMedia_ConvertedFileName: { type: String, required: true },
    networkMedia_fileType: { type: String, required: true },   // 1 for image, 2 for video, 3 document, 4 audio
    networkMedia_createdDateTime: { type: Date, default: Date.now },
    inviteVideo: { type: String },

});

var networkMediaCollection = module.exports = mongoose.model('networkMedia', networkMediaSchema);



// add network media
module.exports.addNetworkMedia = function (networkMedia, callback) {
    networkMediaCollection.create(networkMedia, callback);
}


// get all network media
module.exports.getNetworkMedia = function (query, callback) {
 //   networkMediaCollection.find(query, callback).sort({ "networkMedia_networkId" : -1 });;
     networkMediaCollection.find(query, callback).sort({});;
}
