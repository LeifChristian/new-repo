var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// post comment collection
var commentSchema = new mongoose.Schema({
    post_id: { type: ObjectId,  required: true },
    user_id: { type: ObjectId,  required: true },
    comment_text: { type: String }, // 1 for like and 0 for unlike
    comment_createdDateTime: { type: Date, default: Date.now },
});
var CommentModel = module.exports = mongoose.model('CommentModel', commentSchema);


// create comment
module.exports.postcomment = function (comment, callback) {
    CommentModel.create(comment, callback);
}

// get comment
// module.exports.getComment = function (query, callback) {
//     CommentModel.find(query, callback);
// }

module.exports.getComment = function (post_id, callback) {
   CommentModel.aggregate([{"$match" : {post_id : mongoose.Types.ObjectId(post_id) } },{ "$lookup": {"localField": "user_id","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" }], callback);
}
