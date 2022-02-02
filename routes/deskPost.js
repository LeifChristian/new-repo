var express = require('express');
var mongoose=require('mongoose');
var router = express.Router();
var deskPostModel = require('../models/deskPostModel');
var Post = require('../models/postmodel');
var CommentModel = require('../models/commentmodel');
var Network = require('../models/networkmodel');
var networkmodel=mongoose.model("Network")
var request = require('request');
var deskLocationModel = mongoose.model('desklocation');

router.route('/getDeskPost')
.post(function (req, res) {

  deskPostModel.getDeskPostList({user_id : req.body.user_id }, function (error, deskPostList) {
    console.log("deskpostlist",deskPostList);
      if (error)
          return res.send({ status: 'false', message: error});

    //  return res.json(deskPostList);
      if(deskPostList.length > 0){
        var loopstill = (deskPostList.length) - 1;
        console.log("start loooop", loopstill);
        var Jsonresult = [];
       // console.log(deskPostList);
         deskPostList.forEach( function(list,k) {
        //   if(list.desk_type == "1"){
         //    console.log('type1');
           Post.getPostForDesk( list.post_id , function (error, postList) {
            if (error)
                return res.json({ status : 'false', message : err });
              if(postList.length > 0){
                    console.log("lisssstttt", postList);
                    Jsonresult[k] = postList;

                    Post.getTotallikse( { $and : [  { isPostLike : "1" }, {  post_id : postList[0]._id } ] }, function (err, totalLikse) {
                        if (!err)
                        Jsonresult[k][0]['totalLikse'] = totalLikse.length;
                        Jsonresult[k][0]['deskPostDateTime'] = list.deskPost_createdDate;
                        Jsonresult[k][0]['deskPostId'] = list._id;
                       // Jsonresult[k][0]['desk_type'] = "1";
                        Post.isUserLiked( { $and : [  { isPostLike : "1" }, {  post_id : postList[0]._id }, {  user_id : req.body.user_id } ] }, function (err, isLikeOrNot) {
                            if (!err)
                            if(isLikeOrNot.length > 0)
                              Jsonresult[k][0]['isLike'] = '1';
                            else
                              Jsonresult[k][0]['isLike'] = '0';

                              CommentModel.getComment(postList[0]._id, function (error, commentDetail) {
                                if (!error)
                                    Jsonresult[k][0]['comment'] = commentDetail;
                                    console.log("looop", k ,loopstill)
                                    if (k == loopstill)
                                      return res.send({ status: 'true', message: "Desk post list found!", post : Jsonresult });
                              });

                        });

                    });
            //    });
             } 
            //  else {
            //     return res.send({ status: 'true', message: "Post not found!" });
            //  }
          });
        // }else{
        //   console.log('type2');
        //  // console.log("ll",list);
        //   Network.getSingleLocation( list.network_id, list.location_id, function (error, locationData) {
        //       if (error)
        //           return res.send({ status: 'false', message: error});
        //         //  console.log("LL",locationData);
        //           Jsonresult[k] = locationData;
        //       console.log("loopstill",loopstill);
        //           if (k == loopstill)
        //             return res.send({ status: 'true', message: "Desk post list found!", post : Jsonresult });
        //   });
        // }
      });
   }else{
     return res.send({ status: 'true', message: "Post not found in desk!" });
   }
  });
});

router.route('/saveAsDesk')
.post(function (req, res) {
   console.log(req.body);
    deskPostModel.alreadyDesk({ network_id : req.body.network_id, post_id : req.body.post_id, user_id : req.body.user_id }, function (err, postDeskDetail) {
        if(postDeskDetail.length > 0){
            return res.send({ status: 'false', message: "You already desk this post!"});
        }else{

          // return res.json(req.body);
            deskPostModel.saveAsDesk(req.body, function (err, list) {
                if (err)
                    res.json(err);
                else {
                    return res.send({ status: 'true', message: "post added in desk list successfully!", data : list });
                }
            });
        }
    });
});

router.route('/addLocationInDesk')
.post(function(req, res){
  console.log("sknldf", req.body);
  if(req.body.insert == true){
    var receivedValue = req.body;
    if(JSON.stringify(receivedValue) == '{}' || receivedValue == undefined || receivedValue == null){
      res.json({
        status: 400,
        message : "Insert Proper data"
      });
    }else{
      uniqueID = String( Date.now() );
      deskLocationModel.findOne({user_id: req.body.user_id}, function(err, data){
        if(data != null){
          deskLocationModel.update({user_id: req.body.user_id},{$push:{location:{_id: uniqueID, name:req.body.name, address : req.body.address, details : req.body.details, phone : req.body.phone, email : req.body.email}}}, function(err, data){
            if(err) throw err;
            res.json({
              status: 'true', 
              message: "location added successfully!"
            });
          })
        }else{
          deskLocationModel.create({user_id: req.body.user_id, location:{_id: uniqueID, name:req.body.name, address : req.body.address, details : req.body.details, phone : req.body.phone, email : req.body.email}}, function(err, data){
            if(err) throw err;
            res.json({
              status: 'true', 
              message: "location added successfully!"
            });
          })
        }
      })
    }
  }
  if(req.body.delete == true){
    deskLocationModel.update({user_id : req.body.user_id},{$pull:{location:{_id: req.body.location_id}}}, function(err, data){
      if (err) throw err;
      if(data){
          if(req.body.network_id != null || req.body.network_id != "" || req.body.network_id != undefined){
            console.log("in", req.body.network_id);
            console.log("data", data);
            networkmodel.updateOne(
              { _id: req.body.network_id,"location._id": req.body.location_id},
              { $set: { "location.$.saveAsDesk" : false} },(error,updated_location)=>{
                if(error) throw error;
                if(updated_location){
                  res.json({
                    status: true,
                    message: "location deleted"
                  });
                }
              })
          }else{
            res.json({
              status: true,
              message: "location deleted"
            });
          }
      }
    });
  }
});

router.route('/saveLocationAsDesk')
.post(function (req, res) {
  if(req.body.getlocationInDesk===true && req.body.getlocationInDesk!=null){
    var location_in_desk=[];
    // networkmodel.find({user_id:req.body.user_id},(err,network_details)=>{
    //   if(err){
    //     return res.json({ status:500,message:err});
    //   }
    //   if(network_details != null){
    //     if(network_details[0].location != null){
    //       network_details[0].location.forEach(location_detail=>{
    //         if(location_detail.saveAsDesk==true){
    //           location_in_desk.push(location_detail);
    //         }
    //        })
    //     }
    //   }
    // }) 
  
    deskLocationModel.find({'user_id': req.body.user_id}, (err, data)=>{
      console.log("data",data);
      if(data != null){
        if(data[0].location != null){
          data[0].location.forEach(locationData => {
            location_in_desk.push(locationData);
          })
          res.json({status:200,location_detail:location_in_desk})
      }
      }
    })     
  }

  if(req.body.location_id!=null && req.body.network_id!=null && req.body.user_id!=null){
    var location_detail;
    networkmodel.findById({'_id':req.body.network_id},(err,network_detail)=>{
    if(err){
      return res.json({ status:500,message:err});
    }
    else{
    if(network_detail===null || network_detail==null==='{}'){
      return res.send({ status: 'false', message: "No Data Found"});
    }
    else{
    location_detail=network_detail.location;
    location_detail.forEach(location=>{
      if(location._id==req.body.location_id){
        location.network_id = req.body.network_id;
        var locationData = location;
        if(location.saveAsDesk==true){
        return res.send({ status: 'false', message: "You already desk this post!", _id:req.body.location_id});
        }
        networkmodel.updateOne(
        { _id: req.body.network_id,"location._id": req.body.location_id},
        { $set: { "location.$.saveAsDesk" : true} },(error,updated_location)=>{
          if(error){
            return res.json({ status:500,message:error});
          }
          if(updated_location){
            deskLocationModel.findOne({user_id: req.body.user_id}, function(err, dataobj){
              if(dataobj != null){
                deskLocationModel.update({ user_id : req.body.user_id }, {$push:{location:locationData}}, function (err, isUpdate) {
                  if(err) throw err;
                  if(isUpdate){
                    return res.json({ status: 'true', message: "post added in desk list successfully!" });
                  }
                })
              }else{
                deskLocationModel.create({user_id : req.body.user_id, location:locationData}, function (err, isUpdate) {
                  if(err) throw err;                  
                  if(isUpdate){
                    return res.json({ status: 'true', message: "post added in desk list successfully!" });
                  }
                })
              } 
            });
          } 
        })
      }
      })
    }
  }
})
}
});

router.route('/removeDeskPost')
.post(function (req, res) {
  console.log("body---------", req.body);
    deskPostModel.removeDeskPost( { post_id : req.body._id }, function (error, network) {
      console.log("jbdsafhjas", network); 
      if (error)
            return res.send({ status: 'false', message: error});
          if(network != null)
            {
              console.log("success");
            return res.send({ status: 'true', message: "Desk post removed successfully!" });}
          else
            return res.send({ status: 'false', message: "Desk post not remove!"});
    });
});

module.exports = router;