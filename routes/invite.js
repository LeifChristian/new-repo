var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Invite = require('../models/invitemodel');
var Users = require('../models/users');
var request = require('request');
var async = require('async');
var ObjectId = mongoose.Types.ObjectId();
const nodemailer = require('nodemailer');

module.exports = router;

var getUserId = function(search, searchType, callback) {
      var query = '';
      var userId = '';
      if(searchType == 'phone'){
          query = { user_phone : search }
      } else if (searchType == 'email'){
         query = { user_email : search }
      } else{
        query = { social_id : search }
      }
      Users.getUsersDetail( query , function (error, userProfile) {
          if (error)
              return callback(error);
         if(userProfile != null)
           return callback({status : 'true', data :  userProfile._id, originalId :  search, searchType : searchType});
         else
          return callback( {status : 'false', data :  search, searchType : searchType});
    });

}

var sendMsg = function(numberFrom, numberTo, msgType) {
  // demo msg92
  var msgBody = '';
  if(msgType == 1){
      console.log('invite' + numberTo);
      msgBody = 'https://control.msg91.com/api/sendhttp.php?authkey=175739A7lL0yhWEx59c3747a&mobiles='+numberTo+'&message=Invite%20from%20pocket%20desk%20app&sender=611332&route=1';
  }else{
      console.log('download' + numberTo);
      msgBody = 'https://control.msg91.com/api/sendhttp.php?authkey=175739A7lL0yhWEx59c3747a&mobiles='+numberTo+'&message=Download%20the%20pocket%20desk%20app&sender=611332&route=1';
  }
  request(msgBody, function (error, response, body) {
       // response.statusCode == 200
      if(true)
            return  true;
          else
            return  false;

  });
};

var sendMail = function(from, to, mailType, callback) {
// Generate SMTP service account from ethereal.email
  nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }
    // Create a SMTP transporter object
    var transporter = nodemailer.createTransport({
      //  host: 'smtp.ethereal.email',
      //  port: 587,
     //   secure: account.smtp.secure,
        service : "Gmail",
        auth: {
            user: 'pocket.desk11@gmail.com',
            pass: 'pass@word123'
        }
    });

    var subject = '';
    var text = '';
    var html = '';

    if(mailType == 1){

      var subject = 'Network invitation from pocketdesk ✔';
      var text = 'Dear user!';
      var html = '<p><b>"' + from + '"</b> send a invitaion for network, Please accept or reject from application!</p>';

    }else{

      var subject = 'Download Pocketdesk App ✔';
      var text = 'Dear user!';
      var html = 'Please download pocketdesk app on your phone!!';

    }

    // Message object
    var message = {
        from: 'Pocketdesk Info <pocket.desk11@gmail.com>',
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            return false;
        }else{
            return true;
        }
    });
  });
}

router.route('/')
.post(function (req, res) {


// return res.send(req.body);



  var invite_from       = req.body.invite_from;
  var network_id        = req.body.network_id;
  var invite_from_email = req.body.invite_from_email;


  var ifUserIdNotFound = [];
  var alreadySendInvitationId = [];
  var Err = [];


  for (var j=0; j< 3; j++) {

      var searchType = '';

   if(j == 0){
     var arrayData   = req.body.social_id.split(',');
     var arrayLength = req.body.social_id != '' ? arrayData.length : 0;
     searchType = 'social_id';
   }else if(j == 1) {
     var arrayData   = req.body.phone.split(',');
     var arrayLength = req.body.phone != '' ? arrayData.length : 0;
     searchType = 'phone';
   }else if(j == 2){
     var arrayData   = req.body.email.split(',');
     var arrayLength = req.body.email != '' ? arrayData.length : 0;
     searchType = 'email';
   }


   if(arrayLength){

    for (var i=0; i< arrayLength; i++) {

     getUserId(arrayData[i], searchType, function(response){

       console.log(response.searchType);

     if(response.status != 'false'){

      Invite.checkInvitation({ $and: [ {invite_to : response.data}, {invite_from : invite_from}, {network_id : network_id} ]}, function (err, userDetail) {

        if(userDetail != null){

             alreadySendInvitationId.push(arrayData[i]);

        }else{

            if (response.searchType == 'email') {
                sendMail( invite_from_email, response.originalId, '1', function(response){

                });
            }

            if (response.searchType == 'phone') {
                sendMsg('test', response.originalId, '1');
            }

           Invite.inviteUser({invite_from : invite_from, invite_to : response.data, network_id : network_id, phone : '', email : ''}, function (err, isInsert) {
            if (err)
              Err.push(err);
        });

      }

     });

   }else{

      ifUserIdNotFound.push(arrayData[i]);

        Invite.checkInvitation({ $or: [ {phone : response.data}, {email : response.data} ]}, function (err, isNewUserAlreadyExist) {

          if(isNewUserAlreadyExist == null){

                if(response.searchType == 'phone'){

                    sendMsg('test', response.data, '2');

                    Invite.inviteUser({invite_from : invite_from,  network_id : network_id, phone : response.data, email : ''}, function (err, isInsert) {
                     if (err)
                       Err.push(err);

                  });
                }else if(response.searchType == 'email'){

                  sendMail( invite_from_email, response.data, '2', function(response){

                  });

                  Invite.inviteUser({invite_from : invite_from, network_id : network_id, phone : '', email : response.data}, function (err, isInsert) {
                   if (err)
                     Err.push(err);

                  });
              } // end else

         }
        });


     }

   });

  }

 }

}

 return res.send({ status: 'true', message: "Invitation sent to all selected user!", ifUserIdNotFound : ifUserIdNotFound, alreadySendInvitationId : alreadySendInvitationId, Err : Err });

});
