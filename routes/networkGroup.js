var express = require('express');
var router = express.Router();
var networkGroup = require('../models/networkGroupModel');
var bodyParser =    require("body-parser");
var app =   express();
app.use(bodyParser.json());


module.exports = router;

router.route('/createGroup')
.post( function (req, res){

  var arrayData   = req.body.user_id.split(',');
  var arrayLength = req.body.user_id != '' ? arrayData.length : 0;

  // values
  var networkGroupNetwork_id = req.body.network_id;
  req.body.networkGroupNetwork_id = networkGroupNetwork_id;

  networkGroup.createGroup(req.body, function (err, groupResponse) {
        if (err)
            return res.json({ status : 'false', message : err });

          console.log("network group id " + groupResponse._id);
          if(arrayLength){

            for (var i=0; i< arrayLength; i++) {
             req.body.networkGroup_id = groupResponse._id;
             req.body.networkGroupUser_id = arrayData[i];
             networkGroup.addGroupMember(req.body, function (err, memberResponse) {
                   if (err)
                       return res.json({ status : 'false', message : err });

              });
            }

           return res.send({ status: 'true', message: "Group created!"});


         }else{
            return res.send({ status: 'false', message: "User id not found!"});
         }


   });

});

router.route('/getNetworkGroup')
.post(function (req, res) {
        networkGroup.getGroup( req.body.network_id , function (error, groupUser) {
                     if (error)
                         return res.json({ status : 'false', message : 'Network group not found!' });

                         if(groupUser.length < 1)
                            return res.json({ status : 'false', message : 'Network group not found!' });

                         console.log(groupUser);
                         var memberList = [];
                         var resultlengthj = (groupUser.length) - 1;

                         groupUser.forEach( function(groupdata,j) {

                           memberList[j] = groupdata;
                           memberList[j]['groupName'] = "";

                           networkGroup.getGroupMember( groupdata._id , function (error, groupMemberUser) {
                                 if (error)
                                     return res.json({ status : 'false', message : 'Network group not found!' });

                                    memberList[j]['user'] = groupMemberUser;

                                //     console.log(groupMemberUser.user[0].userinfo._id);
                                     console.log("groupMemberUser",groupMemberUser);
                                     console.log(groupMemberUser[0].userinfo.user_phone);

                                    var resultlengthi = (groupMemberUser.length) - 1;
                                    groupMemberUser.forEach( function(memberData,i) {

                                      if(groupMemberUser[i].userinfo.user_name === undefined)
                                            memberList[j]['groupName'] += groupMemberUser[i].userinfo.user_phone+",";
                                      else
                                           memberList[j]['groupName'] += groupMemberUser[i].userinfo.user_name+",";

                                      if (i == resultlengthi && j == resultlengthj)
                                            return res.send({ status: 'true', message: "Network group found!", groupData : memberList });


                                    });



                              });
                         });


             });

});



router.route('/getNetworkGroupDetail')
.post(function (req, res) {
        networkGroup.getGroupDetail( req.body.network_id, req.body.group_id, function (error, groupUser) {
                     if (error)
                         return res.json({ status : 'false', message : 'Network group not found!' });

                         if(groupUser.length < 1)
                            return res.json({ status : 'false', message : 'Network group not found!' });

                         var memberList = [];
                         var resultlengthj = (groupUser.length) - 1;

                         groupUser.forEach( function(groupdata,j) {

                           networkGroup.getGroupMember( groupdata._id , function (error, groupMemberUser) {
                                 if (error)
                                     return res.json({ status : 'false', message : 'Network group not found!' });

                                     var resultlengthi = (groupMemberUser.length) - 1;
                                     groupMemberUser.forEach( function(memberData,i) {

                                     memberList[i] = {};

                                     memberList[i]['pc'] = groupMemberUser[i].userinfo.user_pic;
                                     memberList[i]['id'] = groupMemberUser[i].userinfo._id;

                                      if (i == resultlengthi && j == resultlengthj)
                                            return res.send({ status: 'true', message: "Network group found!", groupData : memberList });


                                    });

                              });
                         });


             });

});
