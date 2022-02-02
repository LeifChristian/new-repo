var express = require('express');
var router = express.Router();
var networkMediaModel = require('../models/networkMediaModel');
var mongoose = require('mongoose');
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;
var networkMedia=mongoose.model("networkMedia");
var Network = require('../models/networkmodel');
var request = require('request');
var bodyParser =    require("body-parser");
var crypto = require('crypto');
var fs=require('fs');
var path = require('path'); 

var async = require('async');
var multer  =   require('multer');
//var getFields = multer();
var mime = require('mime');
var app =   express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:true}));


var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
  callback(null, '/home/ubuntu/pocketdesk/public/images');
},
 filename: function (req, file, callback) {
 console.log(file.fieldname);
 callback(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype) );
}
});

var upload = multer({ storage : storage }).array('mediaImage',1);

 

  //const upload = multer({ dest:'/home/ubuntu/pocketdesk/public/images'}).array('mediaImage',1);


router.route('/addNetworkMedia')
.post(function (req, res, next){  

    upload(req,res,function(err,data){
      if(err) {
        return res.json({ error_code:1,err_desc:err });
     }
                    if(req.files.length!=0){
                      // var fieldname=req.files[0].fieldname;
                      // var ext=req.files[0].mimetype.split("/");
                      // var ConvertedFileName=fieldname + '-' + Date.now() + '.' + ext[1];
                          req.body.networkMedia_ConvertedFileName = req.files[0].filename;
                          req.body.networkMedia_OriginalFileName = req.files[0].originalname;
                           
                               if( typeof(req.files['inviteVideo']) !== 'undefined' && req.files['inviteVideo'].length != 0)
                              req.body.inviteVideo = req.files['inviteVideo'][0].filename;


                        
                        networkMediaModel.addNetworkMedia(req.body, function (err, networkMediaResponse) {
                            if (err){
                              return res.json(err);
                            }
                            else{
                              console.log('id----------------', req.body.networkMedia_networkId);
                              networkMediaModel.find({ networkMedia_networkId : req.body.networkMedia_networkId }, function (error, netWorkDetail) {
                                
                                console.log('dataaa', netWorkDetail);
                                if (error)
                                    throw error;
                                return  res.send({ status: 'true', message: "Network media added" , data : netWorkDetail});
                              });
                            }
                        });
                      }
                 });
                

       
});


router.route('/getNetworkMedia')
.post(function (req, res) {
  console.log("req.networkid",req.body.netword_id,req.body.user_id,req.body.file_type);
  var net_id='';
  if(req.body.netword_id){
    net_id=req.body.netword_id;
    if(req.body.user_id){
    networkMediaModel.getNetworkMedia( { networkMedia_userId :req.body.user_id,networkMedia_networkId : net_id, networkMedia_fileType : req.body.file_type }, function (error, mediaData) {
        if (error)
            return res.send({ status: 'false', message: error});
         if(mediaData !== undefined && mediaData.length > 0)
           return res.send({ status: 'true', message: "Media found!", data : mediaData });
         else
          return res.send({ status: 'false', message: "Media not found!"});
    });
  }else{
     networkMediaModel.getNetworkMedia( { networkMedia_networkId : net_id, networkMedia_fileType : req.body.file_type }, function (error, mediaData) {
        if (error)
            return res.send({ status: 'false', message: error});
         if(mediaData !== undefined && mediaData.length > 0)
           return res.send({ status: 'true', message: "Media found!", data : mediaData });
         else
          return res.send({ status: 'false', message: "Media not found!"});
    });
  }
  }else{
    if(req.body.user_id){
    networkMediaModel.getNetworkMedia( { networkMedia_userId :req.body.user_id, networkMedia_fileType : req.body.file_type }, function (error, mediaData) {
        if (error)
            return res.send({ status: 'false', message: error});
         if(mediaData !== undefined && mediaData.length > 0)
           return res.send({ status: 'true', message: "Media found!", data : mediaData });
         else
          return res.send({ status: 'false', message: "Media not found!"});
    });
  }else{
      networkMediaModel.getNetworkMedia( {  networkMedia_fileType : req.body.file_type }, function (error, mediaData) {
        if (error)
            return res.send({ status: 'false', message: error});
         if(mediaData !== undefined && mediaData.length > 0)
           return res.send({ status: 'true', message: "Media found!", data : mediaData });
         else
          return res.send({ status: 'false', message: "Media not found!"});
    });
  }
  }
});

router.route('/networkMediaInDesk')
.post(function (req, res) {
  if(req.body.getMediaDesk===true){
    var media_in_desk=[];
    networkMedia.find(
      {"$and": [ { "networkMedia_userId":  req.body.user_id }, { "networkMedia_fileType": req.body.media_type} ] },(err,network_detail)=>{
      if(err){
          return res.json({ status: 'Error', message:err});
        }
      else{
        if(network_detail.length==0){
        return res.json({ status: 'false', message:"No Data Found"});
       }
       else{
          network_detail.forEach(network=> {
          
            if(network.isAddDesk===true){
              media_in_desk.push(network);
            }
          });
          if(media_in_desk.length==0){
            return res.json({ status: 'false', message:"No Data Found In Desk"});
          }
          res.json({"Media_In_Desk":media_in_desk, status: 'true'});
       }
      }
    })
  }
  if(req.body._id!=null){
    networkMedia.findById({"_id":req.body._id},(err,network_detail)=>{
      if(err){
        return res.json({ status: 'Error', message:err});
      }
      else{
        if(network_detail.length==0){
          return res.json({ status: 'false', message:"No Data Found"});
        }
        else{
          if(network_detail.isAddDesk == true){
            return res.json({ status: 'false', message:"Media is already in Desk!", _id:req.body._id});
          }
          else{
            network_detail.isAddDesk=true;
            network_detail.save();
            return res.json({ status: 'true', message: "Media added in desk list successfully!" });
          }
        }
      }
    })
  }
})

router.route('/deleteMediaFromDesk')
.post(function(req, res){
    networkMedia.findById({"_id":req.body._id},(err,network_detail)=>{
      if(err){
        return res.json({ code: 500, message:err});
      }
      else{
        if(network_detail.length==0){
          return res.json({ code: 500, message:"No Data Found"});
        }
          else{
            network_detail.isAddDesk=false;
            network_detail.save();
            return res.json({ code: 200, message: "Media deleted from desk list successfully!" });
          }
      }
    })
})
router.route('/networkMediaActions')
.post(function(req, res){
  if(req.body.action == "delete"){
      networkId = req.body._id;
      networkMedia.findOne({"_id": networkId}, function(err, network_detail){
        var imageName;
          imageName = network_detail.networkMedia_ConvertedFileName;
          fs.unlink('/home/ubuntu/pocketdesk/public/images/'+ imageName, (err)=>{
            if(err){
              return res.json({ status: 'Error', message:err});
            }
          });
          networkMedia.deleteOne({"_id": networkId}, function(err){
            if(err){
              return res.json({ status: 'Error', message:err});
            }
            networkMedia.find({ networkMedia_networkId : req.body.networkMedia_networkId }, function (error, netWorkDetail) {
              if (error) throw error;
              res.send({ code: 200, message:"File deleted" , data : netWorkDetail});
            });
          });
      });
  }
  else{
    if(req.body.action == "edit"){
      networkId = req.body._id;
      editedDocName = req.body.edited_image_name;
        networkMedia.updateOne({"_id": networkId},{"networkMedia_OriginalFileName":editedDocName}, function(err, network_detail){
          if(err){
            return res.json({ status: 'Error', message:err});
          }
          res.json({
            code: 200,
            message:"File edited"
          });
        });
    }
  }
  if(req.files === undefined || JSON.stringify(req.body) === '{}' || req.body === undefined || req.body === null)
  {
      upload(req,res,function(err,data){
        if(req.body.action == "editImage"){
        var networkId = req.body._id;

        networkMedia.findOne({"_id": networkId}, function(err, network_detail){
          var imageName;
      
        if(err) {
          return res.json({ error_code:1,err_desc:err });
      }
      imageName = network_detail.networkMedia_ConvertedFileName;
      fs.unlink('/home/ubuntu/pocketdesk/public/images/'+ imageName, (err)=>{
        if(err){
          return res.json({ status: 'Error', message:err});
        }
      });
          if(req.files.length!=0){
              req.body.networkMedia_ConvertedFileName = req.files[0].filename;
              req.body.networkMedia_OriginalFileName = req.files[0].originalname;
                
              networkMedia.updateOne({"_id": networkId},{
                "networkMedia_ConvertedFileName": req.body.networkMedia_ConvertedFileName,
                "networkMedia_OriginalFileName": req.body.networkMedia_OriginalFileName
              }, function(err, networkMediaResponse){
                if(err)
                    return res.json(err);
                else
                    return  res.send({ status: 'true', message: 'Network media Updated'});
              });
            }
          })
        }
        })
  }
});


router.route('/addNetworkMediaInDesk')
.post(function(req, res){
 
    upload(req,res,function(err,data){
      if(err) {
        return res.json({ error_code:1,err_desc:err });
      }    
      console.log('body', req.body);
      console.log('files', req.files);
      if(req.files.length!=0){
            req.body.isAddDesk = true;
            req.body.networkMedia_ConvertedFileName = req.files[0].filename;
            req.body.networkMedia_OriginalFileName = req.files[0].originalname;
            networkMediaModel.addNetworkMedia(req.body, function (err, networkMediaResponse) {
              if (err)
                  return res.json(err);
              else
                return  res.send({ status: 'true', message: 'Network media added'});
          });
        }
    });
                
})

module.exports = router;