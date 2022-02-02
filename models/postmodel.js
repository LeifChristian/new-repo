var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// post collection
var postSchema = new mongoose.Schema({
    network_id: { type: ObjectId },
    user_id: { type: ObjectId,  required: true },
    post_text: { type: String },
    post_pic: { type: String },
    post_type: { type: String, default: 1 }, // 1 for post from network & 2 for post from desk
    post_city: { type: String },
    location_name:{ type: String },
    post_lat: { type: String },
    post_lng: { type: String },
    post_status: { type: String, default: 1},
    post_createdDateTime: { type: Date, default: Date.now },
});
var Post = module.exports = mongoose.model('Post', postSchema);


// post like collection
var postLikeSchema = new mongoose.Schema({
    post_id: { type: ObjectId,  required: true },
    user_id: { type: ObjectId,  required: true },
    isPostLike: { type: String }, // 1 for like and 0 for unlike
    postLike_createdDateTime: { type: Date, default: Date.now },
});

var postLike = module.exports = mongoose.model('postLike', postLikeSchema);


// create post
module.exports.addpost = function (post, callback) {
    Post.create(post, callback);
}

// update post
module.exports.updatepost = function (query, update, callback) {
    Post.update(query, update, callback);
}


// get all post
module.exports.getPost = function (network_id, callback) {
   Post.aggregate( [ { "$sort" : {_id : -1}  }, {"$match" : {network_id : mongoose.Types.ObjectId(network_id) } },{ "$lookup": {"localField": "network_id","from": "networks","foreignField": "_id","as": "networkinfo"} },{ "$unwind": "$networkinfo" }, { "$lookup": {"localField": "user_id","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" } ], callback);
}

// get all my post
module.exports.getMyPost = function (user_id, callback) {
   Post.aggregate( [ { "$sort" : {_id : -1}  }, {"$match" : {user_id : mongoose.Types.ObjectId(user_id) } }, { "$lookup": {"localField": "user_id","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" } ], callback);
}

// get all post
module.exports.getPostForDesk = function (post_id, callback) {
   Post.aggregate( [ {"$match" : {_id : mongoose.Types.ObjectId(post_id) } }, { "$lookup": {"localField": "user_id","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" } ], callback);
}

// check user already like or not
module.exports.checkLikeStatus = function (query, callback) {
    postLike.find(query, callback);
}

// create post like status
module.exports.createPostStatus = function (postStatus, callback) {
    postLike.create(postStatus, callback);
}

// update post like status
module.exports.updatePostStatus = function (query, update, callback) {
    postLike.update(query, update, callback);
}

// count total likes
module.exports.getTotallikse = function (query, callback) {
    postLike.find(query, callback).count();
}

// check user liked or not liked
module.exports.isUserLiked = function (query, callback) {
    postLike.find(query, callback);
}

// delete post
module.exports.removePost = function (query, callback) {
    Post.remove(query, callback);
}
