var express = require('express');
var router = express.Router();
var taskModel = require('../models/taskModel');
var bodyParser =    require("body-parser");
var Users = require('../models/users');
var app =   express();
app.use(bodyParser.json());


module.exports = router;

router.route('/addTask')
.post( function (req, res){

  var arrayData   = req.body.user_id.split(',');
  var arrayLength = req.body.user_id != '' ? arrayData.length : 0;

  req.body.task_dueDate =  new Date(req.body.task_dueDate).toISOString();
  req.body.task_dueTime =  new Date(req.body.task_dueTime).toISOString();


  console.log("date " + req.body.task_dueDate);

  //var today = new Date('05 October 2011 14:48 UTC');

  //console.log(today.toISOString()); // Returns 2011-10-05T14:48:00.000Z

  taskModel.addTask(req.body, function (err, taskResponse) {
        if (err)
            return res.json({ status : 'false', message : err });

          console.log("network group id " + taskResponse._id);
          if(arrayLength){

            for (var i=0; i< arrayLength; i++) {
             req.body.task_id = taskResponse._id;
             req.body.taskAssignedUser_id = arrayData[i];
             taskModel.addTaskMember(req.body, function (err, memberResponse) {
                   if (err)
                       return res.json({ status : 'false', message : err });

              });
            }

           return res.send({ status: 'true', message: "task created!"});


         }else{
            return res.send({ status: 'false', message: "User id not found!"});
         }


   });

});


router.route('/getTask')
.post(function (req, res) {
     taskModel.getTask( req.body._id , function (error, groupUser) {
           if (error)
               return res.json({ status : 'false', message : 'Task not found!' });

              if(groupUser.length < 1)
                  return res.json({ status : 'false', message : 'Task not found!' });

              var resultlength = (groupUser.length) - 1;
              var memberList = [];
               groupUser.forEach( function(groupUser,i) {
                 memberList[i] = groupUser;
                 taskModel.getTaskMember( groupUser._id , function (error, groupMemberUser) {
                       if (error)
                           return res.json({ status : 'false', message : 'Task not found!' });
                        //   console.log(groupMemberUser);

                          var innerLength = (groupMemberUser.length) - 1;
                          groupMemberUser.forEach( function(test,j){
                        //    console.log(test.taskAssignedUser_id );
                          Users.getUsersDetail( { _id : test.taskAssignedUser_id } , function (error, userDetail) {
                                 if (error)
                                     return res.json({ status : 'false', message : 'Task not found!' });


                                   //console.log(userDetail.user_pic);

                                   memberList[i]['user'] = groupMemberUser;

                                   if(userDetail.user_pic != undefined)
                                      memberList[i]['user'][j]['image'] = userDetail.user_pic;

                                   if(userDetail.user_name != undefined)
                                         memberList[i]['user'][j]['user_name'] = userDetail.user_name;

                                //  console.log(i+ '=' + resultlength);
                                //  console.log(j+ '=' + innerLength);
                                  if (i == resultlength && j == innerLength)
                                        return res.send({ status: 'true', message: "Data found!", data : memberList});


                          });
                        });



                    });
               });

        });
 });

 router.route('/getTaskDetail')
 .post(function (req, res) {
      taskModel.getTaskDetail(  req.body.task_id  , function (error, groupUser) {

            if (error)
                return res.json({ status : 'false', message : 'Task not found!' });

               if(groupUser.length < 1)
                   return res.json({ status : 'false', message : 'Task not found!' });

               var resultlength = (groupUser.length) - 1;
               var memberList = [];
                groupUser.forEach( function(groupUser,i) {
                  memberList[i] = groupUser;
                  taskModel.getTaskMember( groupUser._id , function (error, groupMemberUser) {
                        if (error)
                            return res.json({ status : 'false', message : 'Task not found!' });
                         //   console.log(groupMemberUser);

                           var innerLength = (groupMemberUser.length) - 1;
                           groupMemberUser.forEach( function(test,j){
                         //    console.log(test.taskAssignedUser_id );
                           Users.getUsersDetail( { _id : test.taskAssignedUser_id } , function (error, userDetail) {
                                  if (error)
                                      return res.json({ status : 'false', message : 'Task not found!' });


                                    //console.log(userDetail.user_pic);

                                  if(userDetail !== null){
                                      memberList[i]['user'] = groupMemberUser;
                                      if(userDetail.user_pic !== null && typeof userDetail.user_pic !== 'undefined' )
                                        memberList[i]['user'][j]['image'] = userDetail.user_pic;
                                     }

                                 //  console.log(i+ '=' + resultlength);
                                 //  console.log(j+ '=' + innerLength);
                                   if (i == resultlength && j == innerLength)
                                         return res.send({ status: 'true', message: "Data found!", data : memberList});


                           });
                         });



                     });
                });

         });
  });
