var express = require('express');
var router = express.Router();
var CommentModel = require('../models/commentmodel');
var request = require('request');
var bodyParser =    require("body-parser");
var multer  =   require('multer');
var mime = require('mime');
var app =   express();
app.use(bodyParser.json());


var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
    callback(null, './public/images');
  },
    filename: function (req, file, callback) {
    console.log(file.fieldname);
    callback(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype) );
  }
});

var upload = multer({ storage : storage });


router.route('/postcomment')
.post(function (req, res) {
       CommentModel.postcomment( req.body, function (err, isCreated) {
       if (err)
           res.json(err);
       else {
            if(isCreated){
               CommentModel.getComment(req.body.post_id, function (error, commentDetail) {
                 if (error)
                     throw error;
                 return  res.send({ status: 'true', message: "Comment posted" , data : commentDetail});
             });
             }else{
                return res.send({ status: 'false', message: "Commnet not posted", data : networkDetail});
             }
          }
     });
});


module.exports = router;
