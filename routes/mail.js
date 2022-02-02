var express = require('express');
var mongoose = require('mongoose');
const fs = require('fs');
var router = express.Router();
var Mail = require('../models/mailmodel');
var request = require('request');
var bodyParser =    require("body-parser");
var crypto = require('crypto');
var async = require('async');
var multer  =   require('multer');
var mime = require('mime');
var app =   express();
var ObjectId = mongoose.Types.ObjectId();
app.use(bodyParser.json());

const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
router.route('/')
.post(function (req, res) {

  var recipient_email = req.body.recipient_email.split(',');
  var recipient_id = req.body.recipient_id.split(',');
  var sender_email = req.body.sender_email;
  var sender_id = req.body.sender_id;
  var sender_networkId = req.body.sender_networkId;
  var arrayLength = recipient_email.length;


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

    // Message object
    var message = {
        from: 'Pocketdesk Info <pocket.desk11@gmail.com>',
        to: recipient_email,
        subject: 'Network invitation from pocketdesk ✔',
        text: 'Dear user!',
        html: '<p><b>"' + sender_email + '"</b> send a invitaion for network, Please accept or reject from application!</p>'
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }


        for (var i=0; i< arrayLength; i++) {
          Mail.insvitedUser({sender_email : sender_email, sender_id : sender_id, sender_networkId : sender_networkId, recipient_email : recipient_email[i], recipient_id : recipient_id[i], mail_status : 1}, function (err, isInsert) {
              if (err)
                return  res.json(err);
          });
        }

      return res.send({ status: 'true', message: "Invitation sent to all selected user!"});


    });
});

});


module.exports = router;
