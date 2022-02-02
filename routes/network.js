var express = require('express');
var mongoose = require('mongoose');
const fs = require('fs');
var router = express.Router();
var Network = require('../models/networkmodel');
var Mail = require('../models/mailmodel');
var Post = require('../models/postmodel');
var Invitemodel = require('../models/invitemodel');
var CommentModel = require('../models/commentmodel');
var deskPostModel = require('../models/deskPostModel');
var networkGroup = require('../models/networkGroupModel');
var request = require('request');
var bodyParser =    require("body-parser");
var crypto = require('crypto');
var async = require('async');
var multer  =   require('multer');
var NetworkModel = mongoose.model("Network");
var DeskLocationModel = mongoose.model("desklocation");
var mime = require('mime');
var app =   express();
var ObjectId = mongoose.Types.ObjectId();
app.use(bodyParser.json());

var check_authenticate = function(device_id, device_type, timestamp, token) {
    var secretkey = 'ApiReal0903';
    var data = device_id + device_type + timestamp + secretkey;
    securekey = crypto.createHash('md5').update(data).digest("hex");
    if (token === securekey) {
        return true;
    }{
        return true;
    }
}

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
    callback(null, '/home/ubuntu/pocketdesk/public/images');
  },
    filename: function (req, file, callback) {
    console.log(file.fieldname);
    callback(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype) );
  }
});

// 1 mb image upload and png, jpg, gif or jpeg allowed
var upload = multer({ storage : storage, limits: { fileSize: 12000000 },

    fileFilter: function(req, file, callback) {
      var ext = mime.extension(file.mimetype)
      if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
        return callback('Only png, jpg, gif or jpeg are allowed', null)
      }
      callback(null, true)
    }

 }).array('coverPhoto',1);

// 12 mb video upload and only mp4 allowed
var uploadVideo = multer({ storage : storage, limits: { fileSize: 12000000 },

  fileFilter: function(req, file, callback) {
      var ext = mime.extension(file.mimetype)
     // return callback(ext, null)
      if (ext !== 'mp4') {
        return callback('Only mp4 are allowed', null)
      }
      callback(null, true)
    }

 }).array('inviteVideo',1);


// 1 mb image upload and png, jpg, gif or jpeg allowed
var uploadImage = multer({ storage : storage, limits: { fileSize: 12000000 },

    fileFilter: function(req, file, callback) {
      var ext = mime.extension(file.mimetype)
      // if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
      //   return callback('Only png, jpg, gif or jpeg are allowed', null)
      // }
      callback(null, true)
    }

 }).array('userPhoto',1);


// 1 mb image upload and png, jpg, gif or jpeg allowed
var uploadMediaImage = multer({ storage : storage, limits: { fileSize: 12000000 },

    fileFilter: function(req, file, callback) {
      var ext = mime.extension(file.mimetype)
      // if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
      //   return callback('Only png, jpg, gif or jpeg are allowed', null)
      // }
      callback(null, true)
    }

 }).array('mediaImage',1);


 var uploadCoverPhotoImage = multer({ storage : storage, limits: { fileSize: 12000000 },

     fileFilter: function(req, file, callback) {
       var ext = mime.extension(file.mimetype)
       // if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
       //   return callback('Only png, jpg, gif or jpeg are allowed', null)
       // }
       callback(null, true)
     }

  }).array('coverphotoImage',1);

var upload2 = multer({ storage : storage });


router.route('/')
.post(function (req, res) {
    console.log(req.body.user_id);
    Network.getNetwork( { $and : [{user_id : req.body.user_id }, { network_status : 0 } ]}, function (error, networkList) {
        if (error)
            return res.json({ status : 'false', message : error });

            if(networkList != null){

                  Invitemodel.getjoinedNetwork( req.body.user_id , function (error, getjoinedNetworkData) {
                     if (error)
                         return res.json({ status : 'false', message : err });


                         Invitemodel.networkInvitationList( req.body.user_id, function (error, inviteNetwork) {
                             if (error)
                                 return res.send({ status: 'false', message: error});
                                    return res.send({ status: 'true', message: "Network list found!", data : networkList, getjoinedNetwork : getjoinedNetworkData, inviteNetwork : inviteNetwork });
                         });


                 });




            //  return res.send({ status: 'true', message: "Network detail found!", data : network });
            } else {
              return res.send({ status: 'false', message: "Network list found!"});
            }

       // res.json(userslist);
      //  return res.send({ status: 'true', message: "Network list found!", data : networkList });
    });
});

// router.route('/allNetwork')
// .post(function (req, res) {
//     console.log(req.body.user_id);
//     Network.allNetwork( function (error, networkList) {
//         if (error)
//             throw error;
//        // res.json(userslist);
//         return res.send({ status: 'true', message: "Network list found!", data : networkList });
//     });
// });

router.route('/allNetwork')
.post(function (req, res) {
    Network.allNetwork( function (error, networkList) {
        if (error)
          return res.json(error);
       // res.json(userslist);
        return res.send({ status: 'true', message: "Network list found!", data : networkList });
    });
});


router.route('/networkChangeStatus')
.post(function (req, res) {
    var msg = '';
    if(req.body.status == 0)
       msg = 'Network inctive';
     else
       msg = 'Network active';
    Network.networkChangeStatus({ _id : req.body._id }, { network_status : req.body.status }, function (err, isActive) {
                       if (err)
                           res.json(err);
                       else {
                             Network.getNetwork({ _id : req.body._id }, function (error, networklist) {
                               if (error)
                                   throw error;
                               return  res.send({ status: 'true', message: msg , data : networklist});
                           });
                    }
     });

});

router.route('/addNetworkImage')
.post(function (req, res) {
          uploadMediaImage(req,res,function(err, data) {
                if(err) {
                     return res.json({ error_code:1,err_desc:err });
                  }else{
                    if(req.files.length != 0){
                          req.body.imageName = req.files[0].filename;
                          req.body.originalName = req.files[0].originalname;
                        }

                       var uniqId =  Date.now();
                       Network.netWorkUpdate( { _id : req.body._id }, {$push:{media:{_id:uniqId, imageName:req.body.imageName, originalName : req.body.originalName }}}, function (err, isUpdate) {
                       if (err)
                           return res.json(err);
                       else {

                              if(isUpdate){

                                 Network.getNetwork({ _id : req.body._id }, function (error, netWorkDetail) {
                                   if (error)
                                       throw error;
                                   return  res.send({ status: 'true', message: "Image updated" , data : netWorkDetail});
                               });

                               }else{
                                   return res.send({ status: 'false', message: "Network id not found in records!"});
                              }
                          }
                      });

                }

       });
});

router.route('/addNetworkLocation')
.post(function (req, res) {
        if(req.body.addFromDesk == true){
            Network.checkNetworkLocation({ $and: [ { "_id" : req.body._id}, {  "location.name" : req.body.name } ] }, function (err, networkDetail) {

                if(networkDetail.length > 0){
                    return res.send({ status: 'false', message: "Location already exist in records!", data : networkDetail});
                }else{
         
                var uniqId =  String( Date.now() );
                Network.netWorkUpdate( { _id : req.body._id }, {$push:{location:{_id: uniqId, name:req.body.name, addFromDesk:true, address : req.body.address, details : req.body.details, phone : req.body.phone, email : req.body.email }}}, function (err, isUpdate) {
                if (err)
                    res.json(err);
                else {
         
                     if(isUpdate){
                        Network.getNetwork({ _id : req.body._id }, function (error, netWorkDetail) {
                          if (error)
                                return res.json(error);
                          return  res.send({ status: 'true', message: "Location added" , data : netWorkDetail});
                      });
                      }else{
                         return res.send({ status: 'false', message: "Network not found in records!", data : networkDetail});
                      }
         
                 }
               });
         
               }
             });
        }
        if(req.body.addFromNetwork == true){
            Network.checkNetworkLocation({ $and: [ { "_id" : req.body._id}, {  "location.name" : req.body.name } ] }, function (err, networkDetail) {

                if(networkDetail.length > 0){
                    return res.send({ status: 'false', message: "Location already exist in records!", data : networkDetail});
                }else{
         
                var uniqId =  String( Date.now() );
                Network.netWorkUpdate( { _id : req.body._id }, {$push:{location:{_id: uniqId, name:req.body.name, address : req.body.address, details : req.body.details, phone : req.body.phone, email : req.body.email, isaddTodesk : req.body.isaddTodesk,saveAsDesk:false  }}}, function (err, isUpdate) {
                if (err)
                    res.json(err);
                else {
         
                     if(isUpdate){
         
                       if(req.body.isaddTodesk == 1){
         
                             Network.getNetwork({ _id : req.body._id }, function (error, netWorkDetail) {
                               if (error)
                                   throw error;
         
         
         
                                   let locationLenth = netWorkDetail[0].location.length;
         
         
         
                                   let location_id = netWorkDetail[0].location[locationLenth-1]._id;
         
         
         
                                   var setObj = { network_id : req.body._id, location_id : location_id, user_id : req.body.user_id, desk_type: "2" }
         
                                   deskPostModel.saveLocationAsDesk(setObj, function (err, savelocationAsDesk) {
                                       if (err)
                                           return res.json(err);
                                   });
         
                           });
         
         
                       }
         
                        Network.getNetwork({ _id : req.body._id }, function (error, netWorkDetail) {
                          if (error)
                                return res.json(error);
                          return  res.send({ status: 'true', message: "Location added" , data : netWorkDetail});
                      });
                      }else{
                         return res.send({ status: 'false', message: "Network not found in records!", data : networkDetail});
                      }
         
                 }
               });
         
               }
             });
        }
});

router.route('/addCalendar')
.post(function (req, res) {

       Network.checkCalendarExist({ $and: [ { "_id" : req.body.network_id}, {  "calendar.calendar_title" : req.body.calendar_title } ] }, function (err, calendarDetail) {

       if(calendarDetail.length > 0){
           return res.send({ status: 'false', message: "Calendar title already exist!", data : calendarDetail});
       }else{

       var uniqId =  Date.now();
       Network.netWorkUpdate( { _id : req.body.network_id }, {$push:{calendar:{_id: uniqId, calendar_title:req.body.calendar_title, time : req.body.time, date : req.body.date, lat : req.body.lat, lng : req.body.lng  }}}, function (err, isUpdate) {
       if (err)
           return res.json(err);
       else {

            if(isUpdate){
               Network.getNetwork({ _id : req.body.network_id }, function (error, netWorkDetail) {
                 if (error)
                     throw error;
                 return  res.send({ status: 'true', message: "Calendar added!" , data : netWorkDetail});
             });
             }else{
                return res.send({ status: 'false', message: "Network not found in records!", data : networkDetail});
             }

        }
      });

      }
    });

});



router.route('/networkDetail')
.post(function (req, res) {
    Network.networkDetail( { _id : req.body._id }, function (error, network) {
        if (error)
            throw error;
          if(network != null){

         Invitemodel.joinedNetworkUser( req.body.user_id, req.body._id, function (error, joinedUser) {
            if (!error)

             Post.getPost( req.body._id , function (error, postList) {
               if (error)
                   return res.json({ status : 'false', message : 'Network detail not found!' });

               networkGroup.getGroup( req.body._id , function (error, groupUser) {
                     if (error)
                         return res.json({ status : 'false', message : 'Network detail not found!' });

                      //  return res.send(groupUser);

                        var memberList = [];
                         groupUser.forEach( function(groupdata,i) {
                           memberList[i] = groupdata;
                           networkGroup.getGroupMember( groupdata._id , function (error, groupMemberUser) {
                                 if (error)
                                     return res.json({ status : 'false', message : 'Network detail not found!' });

                                 memberList[i]['user'] = groupMemberUser;

                              });
                         });

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

                                 deskPostModel.isUserDeskedThisPost( { $and : [  { network_id : req.body._id }, {  post_id : posts._id }, {  user_id : req.body.user_id } ] }, function (err, isDeskOrNot) {
                                     if (!err)
                                     if(isDeskOrNot.length > 0)
                                       Jsonresult[i]['isDesk'] = '1';
                                     else
                                       Jsonresult[i]['isDesk'] = '0';


                                 CommentModel.getComment(posts._id, function (error, commentDetail) {
                                   if (!error)

                                       Jsonresult[i]['comment'] = commentDetail;
                                       if (i == resultlength)
                                         return res.send({ status: 'true', message: "Network detail found!", data : network, post : Jsonresult, joinedUser : joinedUser, groupUser : memberList, from:"i == resultlength response" });

                                 });


                              });

                           });

                       });
                   });
                } else {
                   return res.send({ status: 'true', message: "Network detail found!", data : network, post : '', joinedUser : joinedUser, groupUser : memberList, from:"postList.length > 0 else part"  });
                }
             });
           });
         });
          //  return res.send({ status: 'true', message: "Network detail found!", data : network });
          } else {
            return res.send({ status: 'false', message: "Network detail not found!", from:"Network.networkDetail else part"});
          }
    });
});


router.route('/userPhoto')
.post(function (req, res) {
          uploadImage(req,res,function(err, data) {
                if(err) {
                     res.json({error_code:1,err_desc:err});
                  }else{
                    return res.json(req.files[0].filename);
                }

       });
});

router.route('/addNetwork')
.post( upload2.fields([{
           name: 'inviteVideo', maxCount: 1
         }, {
           name: 'coverPhoto', maxCount: 1
         }]), function(req, res, next){
             console.log('request body--------', req.body);
             console.log('request file--------', req.files);
        
            if( typeof(req.files['inviteVideo']) !== 'undefined' && req.files['inviteVideo'].length != 0)
                       req.body.inviteVideo = req.files['inviteVideo'][0].filename;
                      
              if( typeof(req.files['coverPhoto']) !== 'undefined' && req.files['coverPhoto'].length != 0)
                       req.body.coverPhoto = req.files['coverPhoto'][0].filename;
                       
              var vedioName = '';
              var isAut = check_authenticate(req.body.user_device_id, req.body.user_device_type, req.body.timestamp, req.body.token)
              if(!isAut){
                  return  res.send({ status: 'false', message: 'Unauthorize user!'});
              }else{

                 Network.checkNetworkExist({ $and: [ {networkName : req.body.networkName}, {user_id : req.body.user_id} ]}, function (err, networkDetail) {

                  if(networkDetail != null){
                     if( typeof(req.files['inviteVideo']) !== 'undefined' && req.files['inviteVideo'].length != 0)
                      fs.unlink('./public/images/'+req.body.inviteVideo);

                     if( typeof(req.files['coverPhoto']) !== 'undefined' && req.files['coverPhoto'].length != 0)
                      fs.unlink('./public/images/'+req.body.coverPhoto);

                      return res.send({ status: 'false', message: "network already exist!", data : networkDetail});

                  }else{

                         Network.createNetwork(req.body, function (err, networkDetail) {

                            if (err)
                                return res.json(err);
                            else {

                              Invitemodel.inviteUser({invite_from : req.body.user_id, invite_to : req.body.user_id, network_id : networkDetail._id, is_invitationAccepted : '1', is_user_admin : '1'}, function (err, isInsert) {
                               if (!err)
                                   return  res.send({ status: 'true', message: 'Network created' , data : networkDetail});
                              });

                            }
                        })


             }
         });
       }


});


router.route('/deleteNetwork')
.post(function (req, res) {
    Network.removeNetwork( { _id : req.body._id }, function (error, network) {
        if (error)
            return res.send({ status: 'false', message: error});
          if(network != null)
            return res.send({ status: 'true', message: "Network deleted successfully!" });
          else
            return res.send({ status: 'false', message: "Network not delete!"});
    });
});


router.route('/deleteFile')
.post(function (req, res) {

    Network.netWorkUpdate( { _id : req.body._id }, {$pull:{media:{_id: req.body.file_id }}}, function (err, isRemoveFile) {

    if (err)
          return res.send({ status: 'false', message: err});
    else {
           if(isRemoveFile){
              Network.getNetwork({ _id : req.body._id }, function (error, netWorkDetail) {
                if (error)
                    return res.send({ status: 'false', message: error});
                return  res.send({ status: 'true', message: "Image deleted successfully!" , data : netWorkDetail});
            });

            }else{
                return res.send({ status: 'false', message: "Image not delete!"});
           }
       }
   });

});


router.route('/deleteLocation')
.post(function (req, res) {

        Network.netWorkUpdate( { _id : req.body._id }, {$pull:{location:{_id: req.body.file_id }}}, function (err, isRemoveLocation) {

            if (err)
                  return res.send({ status: 'false', message: err});
            else {
                   if(isRemoveLocation){
                      Network.getNetwork({ _id : req.body._id }, function (error, netWorkDetail) {
                        if (error)
                            return res.send({ status: 'false', message: error});
                        return  res.send({ status: 'true', message: "Location deleted successfully!" , data : netWorkDetail});
                    });
        
                    }else{
                        return res.send({ status: 'false', message: "Location not delete!"});
                   }
               }
           });

});



router.route('/deleteCalendar')
.post(function (req, res) {

    Network.netWorkUpdate( { _id : req.body._id }, {$pull:{calendar:{_id: req.body.calendar_id }}}, function (err, isRemoveCalendar) {

    if (err)
          return res.send({ status: 'false', message: err});
    else {
           if(isRemoveCalendar){
              Network.getNetwork({ _id : req.body._id }, function (error, netWorkDetail) {
                if (error)
                    return res.send({ status: 'false', message: error});
                return  res.send({ status: 'true', message: "Calendar deleted successfully!" , data : netWorkDetail});
            });

            }else{
                return res.send({ status: 'false', message: "Calendar not delete!"});
           }
       }
   });

});

router.route('/getAllLocation')
.post(function (req, res) {
    Network.getAllLocation( { _id : req.body.netword_id }, {_id : 1, location : 1}, function (error, locationList) {
        if (error)
            return res.send({ status: 'false', message: error});
        if(locationList[0].location !== 'undefined' && locationList[0].location.length > 0)
          return res.send({ status: 'true', message: "Location found!", data : locationList });
        else
          return res.send({ status: 'false', message: "Location not found!"});
    });
});

router.route('/updateLocation')
.post(function(req, res){
    var updateLocation = { "location.$.name" : req.body.name,
    "location.$.address" : req.body.address,
    "location.$.details" : req.body.details,
    "location.$.phone" : req.body.phone,
    "location.$.email" : req.body.email,
  }
    if(req.body.updateNetworkLocation == true){
            NetworkModel.updateOne(
                {_id : req.body.network_id, "location._id": req.body.location_id},
                { $set: updateLocation},(err,updated_location)=>{
                    if(err) throw err;
                    NetworkModel.findOne({_id: req.body.network_id}, (err, networkData)=>{
                        if(err) throw err;
                        networkData.location.forEach(locationData => {
                            if(locationData._id == req.body.location_id){
                                if(locationData.saveAsDesk){
                                    DeskLocationModel.updateOne(
                                    {user_id : req.body.user_id, "location._id": req.body.location_id},
                                    { $set: updateLocation},(error,updated_location)=>{
                                        if (error) throw error;
                                        res.json({status: 'true',message: "Location Updated"});
                                    })
                                }
                                else{res.json({status: 'true',message: "Location Updated"});}
                            }
                        })
                    });
                }
            );
    }
    if(req.body.updatedeskLocation == true){
        var receivedValues = req.body;
        if(JSON.stringify(receivedValues != '{}' || receivedValues != undefined || receivedValues != null)){
            DeskLocationModel.updateOne(
                {user_id : req.body.user_id, "location._id": req.body.location_id},
                { $set: updateLocation},(error,updated_location)=>{
                            if(error) throw error;
                            res.json({status: 'true',message: "Location Updated"});
                        })
        }else{res.json({status: 'false', message: "insert proper data"});}
    }
});


// get all media
router.route('/getAllMedia')
.post(function (req, res) {
    Network.getAllMedia( { _id : req.body.netword_id }, {_id : 1, media : 1}, function (error, mediaList) {
        if (error)
            return res.send({ status: 'false', message: error});
        if(mediaList[0].media !== 'undefined' && mediaList[0].media.length > 0)
          return res.send({ status: 'true', message: "Media found!", data : mediaList });
        else
          return res.send({ status: 'false', message: "Media not found!"});
    });
});

// get all calnedar
router.route('/getAllCalendar')
.post(function (req, res) {
    Network.getAllCalendar( { _id : req.body.netword_id }, {_id : 1, calendar : 1}, function (error, calendarList) {
        if (error)
            return res.send({ status: 'false', message: error});
        if(calendarList[0].calendar !== 'undefined' && calendarList[0].calendar.length > 0)
          return res.send({ status: 'true', message: "Calendar found!", data : calendarList });
        else
          return res.send({ status: 'false', message: "Calendar not found!"});
    });
});

// get all acceted network list
router.route('/acceptdNetworkList')
.post(function (req, res) {
    console.log(req.body.recipient_id);
    Mail.acceptdNetworkList( req.body.recipient_id, function (error, networkList) {
        if (error)
             return res.send({ status: 'false', message: error});
            if(networkList != null)
              return res.send({ status: 'true', message: "List found!", data : networkList });
                else
            return res.send({ status: 'false', message: "There is not any accepted network!"});
    });
});

// get all invited network list
router.route('/networkInvitationList')
.post(function (req, res) {
    console.log(req.body.invite_to);
    Invitemodel.networkInvitationList( req.body.invite_to, function (error, networkList) {
        if (error)
            return res.send({ status: 'false', message: error});
            if(networkList != null)
              return res.send({ status: 'true', message: "List found!", data : networkList });
                else
            return res.send({ status: 'false', message: "There is not any invitation found!"});
    });
});


// reponse on invitation request
router.route('/responseOnInvitation')
.post(function (req, res) {
     var msg = '';
     if(req.body.status == 1){
        msg = 'Invitation Accepted!';
        Invitemodel.responseOnInvitation({ _id : req.body._id }, { is_invitationAccepted : req.body.status }, function (err, isAccept) {
                     if (err)
                         return res.json({ status : 'false', message : err });
                     else {
                          if(isAccept != null){

                            Network.getNetwork( { $and : [{user_id : req.body.user_id }, { network_status : 0 } ]}, function (error, networkList) {
                                if (error)
                                    return res.json({ status : 'false', message : error });

                                    if(networkList != null){

                                          Invitemodel.getjoinedNetwork( req.body.user_id , function (error, getjoinedNetworkData) {
                                             if (error)
                                                 return res.json({ status : 'false', message : err });


                                                 Invitemodel.networkInvitationList( req.body.user_id, function (error, inviteNetwork) {
                                                     if (error)
                                                         return res.send({ status: 'false', message: error});
                                                           return res.send({ status: 'true', message: msg, data : networkList, getjoinedNetwork : getjoinedNetworkData, inviteNetwork : inviteNetwork});
                                                 });


                                         });


                                    //  return res.send({ status: 'true', message: "Network detail found!", data : network });
                                    } else {
                                      return res.send({ status: 'false', message: "Network list found!"});
                                    }

                            });


                          }else{
                            return res.send({ status: 'true', message: "Some error!"});
                      }
                  }
         });
      }else{
        msg = 'Invitation Rejected!';
        Invitemodel.removeInvitation({ _id : req.body._id }, function (err, isRemoved) {
                     if (err)
                         return res.json({ status : 'false', message : err });
                     else {
                          if(isRemoved){

                            Network.getNetwork( { $and : [{user_id : req.body.user_id }, { network_status : 0 } ]}, function (error, networkList) {
                                if (error)
                                    return res.json({ status : 'false', message : error });

                                    if(networkList != null){

                                          Invitemodel.getjoinedNetwork( req.body.user_id , function (error, getjoinedNetworkData) {
                                             if (error)
                                                 return res.json({ status : 'false', message : err });


                                                 Invitemodel.networkInvitationList( req.body.user_id, function (error, inviteNetwork) {
                                                     if (error)
                                                         return res.send({ status: 'false', message: error});
                                                           return res.send({ status: 'true', message: msg, data : networkList, getjoinedNetwork : getjoinedNetworkData, inviteNetwork : inviteNetwork});
                                                 });


                                         });


                                    //  return res.send({ status: 'true', message: "Network detail found!", data : network });
                                    } else {
                                      return res.send({ status: 'false', message: "Network list found!"});
                                 }

                            });

                          }else{
                            return res.send({ status: 'true', message: "Some error!"});
                          }
                  }
         });
      }


});

router.route('/deleteNetworkMember')
.post(function (req, res) {
    Invitemodel.deleteNetworkMember( { _id : req.body._id }, function (error, member) {
        if (error)
            return res.send({ status: 'false', message: error});


          if(member.result.n == 1){

            Invitemodel.joinedNetworkUser2( req.body.network_id, function (error, joinedUser) {
               if (!error)
              return res.send({ status: 'true', message: "member removed successfully!", joinedUser : joinedUser });
            });

          }else{

            Invitemodel.joinedNetworkUser2( req.body.network_id, function (error, joinedUser) {
               if (!error)
              return res.send({ status: 'false', message: "member not found!!", joinedUser : joinedUser });
            });

        }
    });
});


router.route('/makeNetworkAdmin')
.post(function (req, res) {
    var arrayData   = req.body._id.split(',');
    var arrayLength = req.body._id != '' ? arrayData.length : 0;
    if(arrayLength){
        for (var i=0; i< arrayLength; i++) {

            Invitemodel.makeNetworkAdmin( { _id : arrayData[i] }, { is_user_admin : '1' } , function (err, isUpdate) {
            if (err)
                res.json(err);

            });

          }

          Invitemodel.joinedNetworkUser2( req.body.network_id, function (error, joinedUser) {
             if (!error)
            return res.send({ status: 'true', message: "Success", joinedUser : joinedUser });
          });


    }else{
       return res.send({ status: 'false', message: "Invitation id's not found!"});
    }
});


router.route('/networkSetting')
.post(function (req, res) {
          uploadCoverPhotoImage(req,res,function(err, data) {
           var Invitemodel = require('../models/invitemodel');
     if(err) {
           var Invitemodel = require('../models/invitemodel');
          return res.json({ error_code:1,err_desc:err });
           var Invitemodel = require('../models/invitemodel');
       }else{
           var Invitemodel = require('../models/invitemodel');
         var obj = {networkName:req.body.networkName};
                    if(req.files.length != 0){
                          req.body.imageName = req.files[0].filename;
                          req.body.originalName = req.files[0].originalname;
                          obj = {networkName:req.body.networkName, coverPhoto : req.body.imageName};
                        }
                        console.log(obj);
                       var uniqId =  Date.now();
                       Network.netWorkUpdate( { _id : req.body._id }, { $set:  obj }, function (err, isUpdate) {
                       if (err)
                           return res.json(err);
                       else {

                              if(isUpdate){

                                 Network.getNetwork({ _id : req.body._id }, function (error, netWorkDetail) {
                                   if (error)
                                       throw error;
                                   return  res.send({ status: 'true', message: "Image updated" , data : netWorkDetail});
                               });

                               }else{
                                   return res.send({ status: 'false', message: "Network id not found in records!"});
                              }
                          }
                      });

                }

       });
});


module.exports = router;