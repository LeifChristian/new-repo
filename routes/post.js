var express = require('express');
var router = express.Router();
var Post = require('../models/postmodel');
var CommentModel = require('../models/commentmodel');
var deskPostModel = require('../models/deskPostModel');
var request = require('request');
var bodyParser =    require("body-parser");
var multer  =   require('multer');
var mime = require('mime');
var app =   express();
app.use(bodyParser.json());
var mongoose=require('mongoose');
var postModel = mongoose.model('Post');


var storage =   multer.diskStorage({
       destination: function (req, file, callback) {
       callback(null, '/home/ubuntu/pocketdesk/public/images');
     },
      filename: function (req, file, callback) {
      console.log("file name in upload",file.fieldname);
      callback(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype) );
    }
});

var upload = multer({ storage : storage });

module.exports = router;

router.route('/addpost')
.post(

  upload.fields([{
             name: 'post_pic', maxCount: 1
           }]), function(req, res, next){

      if( typeof(req.files) !== 'undefined')
           //if( typeof(req.files) !== 'undefined' && req.files['post_pic'].length != 0)
                      req.body.post_pic = req.files['post_pic'][0].filename;

      Post.addpost(req.body, function (err, list) {
            if (err)
                return res.json({ status : 'false', message : err });
            else {
               Post.getPost( req.body.network_id , function (error, postList) {
                 if (error)
                     return res.json({ status : 'false', message : err });
                   if(postList.length > 0){
                     var Jsonresult = [];
                     var resultlength = (postList.length) - 1;

                     postList.forEach( function(posts,i) {
                         Jsonresult[i] = posts;

                         Post.getTotallikse( { $and : [  { isPostLike : "1" }, {  post_id : posts._id } ] }, function (err, totalLikse) {
                             if (!err)
                             Jsonresult[i]['totalLikse'] = totalLikse.length;

                             Post.isUserLiked( { $and : [  { isPostLike : "1" }, {  post_id : posts._id }, {  user_id : req.body.user_id } ] }, function (err, isLikeOrNot) {
                                 if (!err)
                                 if(isLikeOrNot.length > 0)
                                   Jsonresult[i]['isLike'] = '1';
                                 else
                                   Jsonresult[i]['isLike'] = '0';

                                   CommentModel.getComment(posts._id, function (error, commentDetail) {
                                     if (!error)

                                         Jsonresult[i]['comment'] = commentDetail;

                                         if (i == resultlength)
                                            return res.send({ status: 'true', message: "Post created successfully!", data : Jsonresult });

                                   });


                             });

                         });
                     });

                   }else{
                     return res.send({ status: 'false', message: "Error while inserting post!"});
                   }
              });
            }
      });


});


router.route('/updatepost')
.post(

//   upload.fields([{
//              name: 'post_pic', maxCount: 1
//            }]), function(req, res, next){
               
//       if( typeof(req.files) !== 'undefined' && req.files['post_pic'].length != 0)
//                       req.body.post_pic = req.files['post_pic'][0].filename;


    upload.fields([{
        name: 'post_pic', maxCount: 1
    }]), function(req, res, next){
       

   if(typeof req.files['post_pic'] !== 'undefined')
               req.body.post_pic = req.files['post_pic'][0].filename;
                console.log("req.body",req.body);
        console.log("req.body" + JSON.stringify(req.body) );

        Post.updatepost( { "_id" : req.body._id } , req.body, function (err, postLikeStatus) {
            if (err)
                return res.json({ status : 'false', message : err });
            else {
               Post.getPost( req.body.network_id , function (error, postList) {
                 if (error)
                     return res.json({ status : 'false', message : err });
                   if(postList.length > 0){
                     var Jsonresult = [];
                     var resultlength = (postList.length) - 1;

                     postList.forEach( function(posts,i) {
                         Jsonresult[i] = posts;

                         Post.getTotallikse( { $and : [  { isPostLike : "1" }, {  post_id : posts._id } ] }, function (err, totalLikse) {
                             if (!err)
                             Jsonresult[i]['totalLikse'] = totalLikse.length;

                             Post.isUserLiked( { $and : [  { isPostLike : "1" }, {  post_id : posts._id }, {  user_id : req.body.user_id } ] }, function (err, isLikeOrNot) {
                                 if (!err)
                                 if(isLikeOrNot.length > 0)
                                   Jsonresult[i]['isLike'] = '1';
                                 else
                                   Jsonresult[i]['isLike'] = '0';

                                   CommentModel.getComment(posts._id, function (error, commentDetail) {
                                     if (!error)

                                         Jsonresult[i]['comment'] = commentDetail;

                                         if (i == resultlength)
                                            return res.send({ status: 'true', message: "Post update successfully!", data : Jsonresult });

                                   });


                             });

                         });
                     });

                   }else{
                     return res.send({ status: 'true', message: "Update successfully completed!"});
                   }
              });
            }
      });


});


router.route('/addDeskPost')
.post(

  upload.fields([{
             name: 'post_pic', maxCount: 1
           }]), function(req, res, next){

      if( typeof(req.files['post_pic']) !== 'undefined' && req.files['post_pic'].length != 0)
    req.body.post_pic = req.files['post_pic'][0].filename;
      Post.addpost(req.body, function (err, addedPost) {
            if (err)
                return res.json({ status : 'false', message : err });
            else {
              console.log("addedddd",addedPost._id);
              req.body.post_id = addedPost._id;
              console.log("bodyyyy",req.body);
              deskPostModel.saveAsDesk(req.body, function (err, list) {
                  if (err) throw err;
                  return res.send({ status: 'true', message: "Post added in desk!" });
            //     deskPostModel.getDeskPostList({user_id : req.body.user_id }, function (error, deskPostList) {
            //       if (error) throw err;
            //       if(deskPostList.length > 0){
            //         var loopstill = (deskPostList.length) - 1;
            //         var Jsonresult = [];
            //          deskPostList.forEach( function(list,k) {
            //           Post.getPostForDesk( list.post_id , function (error, postList) {
            //             if (error) throw error;
            //             console.log("postList",postList)
            //               if(postList.length > 0){
            //                     Jsonresult[k] = postList;

            //                     Post.getTotallikse( { $and : [  { isPostLike : "1" }, {  post_id : postList[0]._id } ] }, function (err, totalLikse) {
            //                         if (!err)
            //                         Jsonresult[k][0]['totalLikse'] = totalLikse.length;
            //                         Jsonresult[k][0]['deskPostDateTime'] = list.deskPost_createdDate;
            //                         Jsonresult[k][0]['deskPostId'] = list._id;

            //                         Post.isUserLiked( { $and : [  { isPostLike : "1" }, {  post_id : postList[0]._id }, {  user_id : req.body.user_id } ] }, function (err, isLikeOrNot) {
            //                             if (!err)
            //                             if(isLikeOrNot.length > 0)
            //                               Jsonresult[k][0]['isLike'] = '1';
            //                             else
            //                               Jsonresult[k][0]['isLike'] = '0';

            //                               CommentModel.getComment(postList[0]._id, function (error, commentDetail) {
            //                                 if (!error)

            //                                     Jsonresult[k][0]['comment'] = commentDetail;
            //                                     if (k == loopstill)
            //                                       return res.send({ status: 'true', message: "Desk post list found!", post : Jsonresult });

            //                               });

            //                         });

            //                     });
            //             //    });
            //              } else {
            //                 return res.send({ status: 'true', message: "Post not found!" });
            //              }
            //           });
            //       });
            //    }
            //    else{
            //      return res.send({ status: 'true', message: "Post not found in desk!" });
            //    }
            //   });
            });
          }
      });

});


router.route('/getPost')
.post(function (req, res) {
     Post.getPost( req.body.network_id , function (error, postList) {
        if (error)
            return res.json({ status : 'false', message : err });
          if(postList.length > 0){
            var Jsonresult = [];
            var resultlength = (postList.length) - 1;
            postList.forEach( function(posts,i) {
                Jsonresult[i] = posts;

                Post.getTotallikse( { $and : [  { isPostLike : "1" }, {  post_id : posts._id } ] }, function (err, totalLikse) {
                    if (!err)
                    Jsonresult[i]['totalLikse'] = totalLikse.length;

                    Post.isUserLiked( { $and : [  { isPostLike : "1" }, {  post_id : posts._id }, {  user_id : req.body.user_id } ] }, function (err, isLikeOrNot) {
                        if (!err)
                        if(isLikeOrNot.length > 0)
                          Jsonresult[i]['isLike'] = '1';
                        else
                          Jsonresult[i]['isLike'] = '0';

                          CommentModel.getComment(posts._id, function (error, commentDetail) {
                            if (!error)

                                Jsonresult[i]['comment'] = commentDetail;

                                if (i == resultlength)
                                return res.send({ status: 'true', message: "Post list found!", data : Jsonresult });

                          });


                    });

                });
            });
          }else{
            return res.send({ status: 'false', message: "Not found any post!"});
          }
    });
});

router.route('/getMyPost')
.post(function (req, res) {
     Post.getMyPost( req.body.user_id , function (error, postList) {
        if (error)
            return res.json({ status : 'false', message : err });
          if(postList.length > 0){
            var Jsonresult = [];
            var resultlength = (postList.length) - 1;
            postList.forEach( function(posts,i) {
                Jsonresult[i] = posts;

                Post.getTotallikse( { $and : [  { isPostLike : "1" }, {  post_id : posts._id } ] }, function (err, totalLikse) {
                    if (!err)
                    Jsonresult[i]['totalLikse'] = totalLikse.length;

                    Post.isUserLiked( { $and : [  { isPostLike : "1" }, {  post_id : posts._id }, {  user_id : req.body.user_id } ] }, function (err, isLikeOrNot) {
                        if (!err)
                        if(isLikeOrNot.length > 0)
                          Jsonresult[i]['isLike'] = '1';
                        else
                          Jsonresult[i]['isLike'] = '0';

                          CommentModel.getComment(posts._id, function (error, commentDetail) {
                            if (!error)

                                Jsonresult[i]['comment'] = commentDetail;

                                if (i == resultlength)
                                return res.send({ status: 'true', message: "Post list found!", data : Jsonresult });

                          });


                    });

                });
            });
          }else{
            return res.send({ status: 'false', message: "Not found any post!"});
          }
    });
});


router.route('/postLikeStatus')
.post(function (req, res) {
    var postStatus = '';
    var msg = '';
    if(req.body.isPostLike == 0){
        req.body.isPostLike = 1;
        msg = 'Post liked!';
    }else{
        req.body.isPostLike = 0;
        msg = 'Post unliked!';
    }
    console.log("body------------", req.body);
    Post.checkLikeStatus({ $and : [{user_id : req.body.user_id }, { post_id : req.body.post_id  } ]}, function (err, postStatus) {
        if(postStatus.length > 0){
          Post.updatePostStatus( { $and : [  { user_id : req.body.user_id }, {  post_id : req.body.post_id } ] } , req.body, function (err, postLikeStatus) {
              if (err)
                  return res.json(err);
              else {
                  Post.getTotallikse( { $and : [  { isPostLike : "1" }, {  post_id : req.body.post_id } ] }, function (err, totalLikse) {
                      if (err)
                          return res.json(err);
                      else {
                            return res.send({ status: 'true', message: msg, postLikeStatus : req.body.isPostLike, totalLikse : totalLikse  });
                      }
                  });


              }
          });
        }else{
            Post.createPostStatus(req.body, function (err, postLikeStatus) {
                if (err)
                    res.json(err);
                else {

                    Post.getTotallikse( { $and : [  { isPostLike : "1" }, {  post_id : req.body.post_id } ] }, function (err, totalLikse) {
                        if (err)
                            return res.json(err);
                        else {
                              return res.send({ status: 'true', message: msg, postLikeStatus : req.body.isPostLike, totalLikse : totalLikse  });
                        }
                    });
                }
            });
        }
    });
});



router.route('/removePost')
.post(function (req, res) {
    postModel.deleteOne( { _id : req.body._id }, function (error, network) {
        if (error)
            return res.send({ status: 'false', message: error});
          if(network != null)
            return res.send({ status: 'true', message: "Post removed successfully!" });
          else
            return res.send({ status: 'false', message: "Error while removing post!"});
    });
});



router.route('/DeskpostUpdate')
.post(function(req,res){
    console.log("req.body",req.body);
    Post.updatepost( { "_id" : req.body._id },req.body,function (err, data) {
        if(err) throw err;
        console.log("data",data);
        return res.send({ status: 'true', message: "Update successfully completed!"});
    });
});

router.route('/UpdateNetwork')
.post( upload.fields([{
    name: 'post_pic', maxCount: 1
}]),function(req, res, next){  
        if(typeof req.files['post_pic'] !== 'undefined')
        req.body.post_pic = req.files['post_pic'][0].filename;
        console.log("req.body",req.body);
        console.log("req.body" + JSON.stringify(req.body) );
        Post.updatedeskpost( { "network_id" : req.body.network_id },req.body,function (err, data) {
            if(err) throw err;
            console.log("data",data);
            return res.send({ status: 'true', message: "Update successfully completed!"});
        });
    });

