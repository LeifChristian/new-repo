var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Invite = require('../models/invitemodel');
var request = require('request');
var bodyParser =    require("body-parser");
var crypto = require('crypto');
var mongoose = require('mongoose');
var userModel = mongoose.model("Users");
var async = require('async');
var multer  =   require('multer');
var mime = require('mime');

const nodemailer = require('nodemailer');

var app =   express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
var twilio = require('twilio');
var accountSid = 'AC6ebe7209c21cd5fbcdb66a63e691737f'; // Your Account SID from www.twilio.com/console
var authToken = '5e971910baf47bfad4fbcfcf0bc4adfd';   // Your Auth Token from www.twilio.com/console
var twilio = require('twilio');



var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
    callback(null, '/home/ubuntu/pocketdesk/public/images');
  },
    filename: function (req, file, callback) {
    console.log(file.fieldname);
    callback(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype) );
  }
});

var upload = multer({ storage : storage }).array('coverphotoImage',1);
var uploadCoverPhotoImage = multer({ storage : storage, limits: { fileSize: 12000000 },

    fileFilter: function(req, file, callback) {
      var ext = mime.extension(file.mimetype)
      callback(null, true)
    }
 }).array('coverphotoImage',1);

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

router.route('/')
.get(function (req, res) {
    Users.getUsers(function (error, userslist) {
        if (error)
            throw error;
       // res.json(userslist);
        return res.send({ status: 'true', message: "User list find!", data : userslist });
    });
});

router.route('/sendOtp')
.post(function (req, res) {
    var isAut = check_authenticate(req.body.user_device_id, req.body.user_device_type, req.body.timestamp, req.body.token)
   // res.send(isAut);
    if(!isAut){
        return  res.send({ status: 'false', message: 'Unauthorize user!'});
    }else{

    var otp = Math.floor(Math.random()*900000) + 100000;
    var currentDateTime = new Date();
    req.body.user_otp = otp;
    req.body.user_otpCreatedDateTime = currentDateTime;
    req.body.user_otpExpiryDateTime = new Date(currentDateTime.getTime() + 5*60000);

    Users.checkUserExist({ $and: [ {user_otpStatus : 1}, {user_phone : req.body.user_phone} ]}, function (err, userDetail) {


        if(userDetail != null){

            return res.send({ status: 'false', message: "User already registered with this phone number, Please try again!", data : userDetail});

        }else{


                    // request('https://control.msg91.com/api/sendotp.php?authkey=169877AZLEcFoB599181ff&mobile='+req.body.user_phone+'&message=Your%20OTP%20is%20'+otp+'&sender=611332&otp='+otp+'&otp_expiry=5&otp_length=6', function (error, response, body) {
                    //      // response.statusCode == 200
                    //     if(true)
                    //           return  res.send({ status: 'true', message: 'Otp send', data : otpDetail});
                    //         else
                    //           return  res.send({ status: 'false', message: 'Otp not send'});
                    //
                    // });

                  //   client.messages.create({
                  //         body: 'Hello from Node',
                  //         to: '+919981104347',  // Text this number
                  //         from: '+14062154416' // From a valid Twilio number
                  //     })
                  // .then((message) => console.log(message.sid));

                  // Pass in parameters to the REST API using an object literal notation. The
                  // REST client will handle authentication and response serialzation for you.
                  var client = new twilio(accountSid, authToken);
                  client.messages.create({
                      to: req.body.user_phone,
                      from:'+14062154416',
                      body:'Your pocket-desk account verification code is:' + otp,
                  }, function(error, message) {
                      // The HTTP request to Twilio will run asynchronously. This callback
                      // function will be called when a response is received from Twilio
                      // The "error" variable will contain error information, if any.
                      // If the request was successful, this value will be "falsy"
                      if (!error) {
                          // The second argument to the callback will contain the information
                          // sent back by Twilio for the request. In this case, it is the
                          // information about the text messsage you just sent:
                          console.log('Success! The SID for this SMS message is:');
                          console.log(message.sid);

                          console.log('Message sent on:');
                          console.log(message.dateCreated);

                          Users.removeNumberIfNotVerified( { user_phone : req.body.user_phone }, function (error, isdelete) {
                              if (error)
                                  return res.send({ status: 'false', message: error});
                          });

                          Users.sendOtp(  req.body , function (err, otpDetail) {
                              if (err)
                                  res.json(err);
                              else {

                                 return  res.send({ status: 'true', message: 'Otp send', data : otpDetail});
                            }
                          });
                      } else {
                          console.log('Oops! There was an error.');
                          console.log(error);
                          return  res.send({ status: 'false', 'error' : error, 'message' : error.message });
                      }
                  });


                  // return  res.send({ status: 'true', message: 'Otp send', data : otpDetail});

          }
      });
    }
});


var sendMsg = function(numberTo) {
  msgBody = 'https://control.msg91.com/api/sendhttp.php?authkey=175739A7lL0yhWEx59c3747a&mobiles='+numberTo+'&message=Invite%20from%20pocket%20desk%20app&sender=611332&route=1';
  request(msgBody, function (error, response, body) {
       // response.statusCode == 200
      if(true)
            return  true;
          else
            return  false;

  });
};


 var sendMail = function(to, callback) {
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



      var subject = 'Network invitation from pocketdesk ✔';
      var text = 'Dear user!';
      var html = '<p>You got invitaion for network, Please accept or reject from application!</p>';



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


router.route('/matchOtp')
.post(function (req, res) {

    var isAut = check_authenticate(req.body.user_device_id, req.body.user_device_type, req.body.timestamp, req.body.token)
   // res.send(isAut);
    if(!isAut){
        return  res.send({ status: 'false', message: 'Unauthorize user!'});
    }else{

    var currentDateTime = new Date();
    var incrmentDatetime = new Date(currentDateTime.getTime() + 5*60000);

    Users.matchOtp( { $and: [ {user_otpExpiryDateTime: {$gte: currentDateTime, $lt: incrmentDatetime}
}, {user_otp : req.body.otp}, {_id : req.body._id} ]}  , function (err, otpMatchDtail) {
        if (err)
            res.json(err);
        else {
            if(otpMatchDtail != null){
                 Users.updateOtpStatus({ _id : otpMatchDtail._id }, { user_otpStatus : '1', user_status : '1' }, function (err, isActive) {
                        if (err)
                            res.json(err);
                        else {
                              Users.getUsersDetail({ _id : otpMatchDtail._id }, function (error, userslist) {
                                if (error)
                                    throw error;

                                    Invite.checkInvitation({  phone : userslist.user_phone }, function (err, isUserHaveInvitation) {
                                      // console.log("phone" + isUserHaveInvitation);
                                      if(isUserHaveInvitation != null){
                                        //   console.log("phone 2" + isUserHaveInvitation);
                                          Invite.updateUserInInvite({ _id : isUserHaveInvitation._id }, { invite_to : userslist._id, phone : '' }, function (err, isUpdate) {
                                                   if (!err)
                                                      sendMsg(userslist.user_phone);
                                            });

                                         }else{

                                          // console.log("email ji " + userslist.user_email);
                                           Invite.checkInvitation({ email: userslist.user_email }, function (err, isUserHaveInvitationEmail) {
                                         //   console.log("email" + isUserHaveInvitationEmail);
                                             if(isUserHaveInvitationEmail != null){
                                            //    console.log("email 2" + isUserHaveInvitation);
                                                 // Invite.updateUserInInvite({ _id : isUserHaveInvitationEmail._id }, { invite_to : userslist._id, email : ''}, function (err, isUpdate) {
                                                 //          if (!err)
                                                 //           sendMail( userslist.user_email, function(response){

                                                 //           });
                                                 //   });

                                                }

                                           });

                                         }

                                        return  res.send({ status: 'true', message: 'Your account has been activated' , data : userslist});

                                    });

                                // res.json(userslist);

                               // return res.send({ status: 'true', message: "User list find!", data : userslist });
                            });
                     }
              });
            }
            else{
                return  res.send({ status: 'false', message: 'Otp not matched or expired!'});
            }
        }
    });
  }
});


router.route('/createPassword')
.post(function (req, res) {
    var isAut = check_authenticate(req.body.user_device_id, req.body.user_device_type, req.body.timestamp, req.body.token)
   // res.send(isAut);
    if(!isAut){
        return  res.send({ status: 'false', message: 'Unauthorize user!'});
    }else{
     Users.createPassword({ _id : req.body.user_id }, { user_password : req.body.new_pass }, { upsert: true }, function (err, password) {
        if (err)
            res.json(err);
        else {
          return  res.send({ status: 'true', message: 'New Password Update successfully' , data : password});
        }
    });
  }
});


router.route('/login')
.post(function (req, res) {
    var isAut = check_authenticate(req.body.user_device_id, req.body.user_device_type, req.body.timestamp, req.body.token)
    if(!isAut){
        return  res.send({ status: 'false', message: 'Unauthorize user!'});
    }else{
     Users.login( { $and : [  {user_phone : req.body.mobile_no}, {user_password : req.body.user_pass}, {user_status : '1'}, {user_otpStatus : '1'} ] }, function (err, userdetail) {
        if (err)
            res.json(err);
        else {
            if(userdetail != null){

              Invite.checkInvitation({ phone : req.body.mobile_no }, function (err, isUserHaveInvitation) {

                if(isUserHaveInvitation != null){

                    Invite.updateUserInInvite({ _id : isUserHaveInvitation._id }, { invite_to : userdetail._id, phone : '' }, function (err, isUpdate) {
                             if (!err)
                                sendMsg(userdetail._id);
                      });

                   }else{

                     Invite.checkInvitation({ email: userdetail.user_email }, function (err, isUserHaveInvitationEmail) {

                       if(isUserHaveInvitationEmail != null){

                           Invite.updateUserInInvite({ _id : isUserHaveInvitationEmail._id }, { invite_to : userdetail._id, email : ''}, function (err, isUpdate) {
                                    if (!err)
                                     sendMail( userdetail.user_email, function(response){

                                     });
                             });

                          }

                     });

                   }

                    return  res.send({ status: 'true', message: 'Login successfully completed!' , data : userdetail});

              });

            }else{
                return  res.send({ status: 'false', message: 'Mobile no. Or password not matched!'});
            }
        }
    });
  }
});

router.route('/totalUser')
.post(function(req, res){
    userModel.find(function(err, data){
        if(err) throw err;
        res.json({
            status: true,
            data: data
        });
    })
})

router.route('/socialLogin')
.post(function (req, res) {
    console.log("bodyyyy-----", req.body);
    var isAut = check_authenticate(req.body.user_device_id, req.body.user_device_type, req.body.timestamp, req.body.token)
   // res.send(isAut);
    if(!isAut){
        return  res.send({ status: 'false', message: 'Unauthorize user!'});
    }else{

        Users.checkUserExist({social_id : req.body.social_id}, function (err, userDetail) {

        if(userDetail != null){
            console.log('responsee-----------',userDetail);
            return  res.send({ status: 'true', message: 'Login successfully completed!' , data : userDetail});

        }else{

         Users.socialLogin(req.body, function (err, socialData) {
            if (err)
                res.json(err);
            else {

               Users.updatesocialdata({ social_id : req.body.social_id }, { user_otpStatus : '1', user_status : '1' }, function (err, isActive) {
                        if (err)
                            res.json(err);
                        else {

                            Users.getUsersDetail({ social_id : req.body.social_id }, function (error, userdatafromdb) {
                                if (error)
                                    throw error;
                                // res.json(userslist);
                                console.log("social login-----------",userdatafromdb);
                                return  res.send({ status: 'true', message: 'Login successfully completed!' , data : userdatafromdb});
                               // return res.send({ status: 'true', message: "User list find!", data : userslist });
                            });


                     }
                 });

            }
         });

     }
    });

  }
});


router.route('/userChangeStatus')
.post(function (req, res) {
     var msg = '';
     if(req.body.status == 0)
        msg = 'Now user inctive';
      else
        msg = 'Now user active';
     Users.userChangeStatus({ _id : req.body._id }, { user_status : req.body.status }, function (err, isActive) {
                if (err)
                    res.json(err);
                else {
                      Users.getUsersDetail({ _id : req.body._id }, function (error, userslist) {
                        if (error)
                            throw error;
                        return  res.send({ status: 'true', message: msg , data : userslist});
                    });
             }
         });

});

router.route('/userUpdateProfile')
.post(function (req, res) {
    
    upload(req,res,function(err, data) {
        if(err) {
            return res.json({ error_code:1,err_desc:err });
        }else{
            var objForUpdate = {};
            if(req.files.length != 0){
                    req.body.imageName = req.files[0].filename;
                    req.body.originalName = req.files[0].originalname;
                    objForUpdate.user_pic = req.body.imageName;
                    if (req.body.user_email) objForUpdate.user_email = req.body.user_email;
                    if (req.body.user_name) objForUpdate.user_name = req.body.user_name;
                    if (req.body.user_password) objForUpdate.user_password = req.body.user_password;
              
                userModel.updateOne( { _id : req.body._id }, { $set:  objForUpdate }, function (err, isUpdate) {
                    if (err)
                        return res.json(err);
                    else {
                        if(isUpdate){
                            userModel.findOne({ _id : req.body._id }, function (error, netWorkDetail) {
                            if (error)
                                throw error;
                            return  res.send({ status: 'true', message: "Image updated" , data : netWorkDetail});
                        });

                        }else{
                            return res.send({ status: 'false', message: "user id not found in records!"});
                        }
                    }
                });
            }
            else{
                if (req.body.user_email) objForUpdate.user_email = req.body.user_email;
                if (req.body.user_name) objForUpdate.user_name = req.body.user_name;
                if (req.body.user_password) objForUpdate.user_password = req.body.user_password;

                userModel.updateOne( { _id : req.body._id }, { $set:  objForUpdate }, function (err, isUpdate) {
                    if (err)
                        return res.json(err);
                    else {
                        if(isUpdate){
                            userModel.findOne({ _id : req.body._id }, function (error, netWorkDetail) {
                            if (error)
                                throw error;
                            return  res.send({ status: 'true', message: "Image updated" , data : netWorkDetail});
                        });

                        }else{
                            return res.send({ status: 'false', message: "user id not found in records!"});
                        }
                    }
                });
            }
        }
    });
});


router.route('/forgotPasswordSendOtp')
.post(function (req, res) {
    var isAut = check_authenticate(req.body.user_device_id, req.body.user_device_type, req.body.timestamp, req.body.token)
    if(!isAut){
        return  res.send({ status: 'false', message: 'Unauthorize user!'});
    }else{

    var otp = Math.floor(Math.random()*900000) + 100000;
    var currentDateTime = new Date();
    req.body.user_otp = otp;
    req.body.user_otpCreatedDateTime = currentDateTime;
    req.body.user_otpExpiryDateTime = new Date(currentDateTime.getTime() + 5*60000);

    userModel.findOne({ user_phone : req.body.user_phone}, function (err, userDetail) {
        if(userDetail == null){
            return res.send({ status: 'false', message: "please enter registered mobile number"});
        }else{
                  var client = new twilio(accountSid, authToken);
                  client.messages.create({
                      to: req.body.user_phone,
                      from:'+14062154416',
                      body:'Your Pocket-Desk Forgot Password Code is : ' + otp,
                  }, function(error, message) {
                     
                      if (!error) {
                          console.log('Success! The SID for this SMS message is:');
                          console.log(message.sid);

                          console.log('Message sent on:');
                          console.log(message.dateCreated);

                          userModel.updateOne( {user_phone : req.body.user_phone},{ forgot_password: req.body } , function (err, otpDetail) {
                              if (err)
                                  res.json(err);
                              else {

                                 return  res.send({ status: 'true', message: 'Otp send', user_id : userDetail._id});
                            }
                          });
                      } else {
                          console.log('Oops! There was an error.');
                          console.log(error);
                          return  res.send({ status: 'false', 'error' : error, 'message' : error.message });
                      }
                  });
          }
      });
    }
});

router.route('/forgotPasswordMatchOtp')
.post(function (req, res) {

    var isAut = check_authenticate(req.body.user_device_id, req.body.user_device_type, req.body.timestamp, req.body.token)
    if(!isAut){
        return  res.send({ status: 'false', message: 'Unauthorize user!'});
    }else{

    var currentDateTime = new Date();
    var incrmentDatetime = new Date(currentDateTime.getTime() + 5*60000);

    userModel.findOne( {_id : req.body._id}  , function (err, otpMatchDtail) {
        if (err)
            res.json(err);
        else {
            if(otpMatchDtail.forgot_password.user_otp == req.body.otp){
                if(otpMatchDtail.forgot_password.user_otpExpiryDateTime >= currentDateTime && otpMatchDtail.forgot_password.user_otpExpiryDateTime < incrmentDatetime)
                {
                    res.send({ status: 'true', message: 'otp matched', user_id: otpMatchDtail._id});
                }else{
                    res.send({ status: 'false', message: 'Code expired'});
                }
            }else{
                res.send({ status: 'false', message: "Code doesn't match"});
            }
           
        }
    });
  }
});

router.route('/resetForgotPassword')
.post(function (req, res) {
	userModel.updateOne({_id : req.body.user_id}, {user_password: req.body.password}, function(error, userdata){
        if (error) throw error;
        if(userdata){
            res.send({ status: 'true', message: "Password Reset Successfully"});
        }
    });
});


router.route('/getuserprofile')
.post(function (req, res) {
	
	//return res.send({ status: 'false', message: "Data not found" });

    Users.getUsersDetail({_id : req.body.user_id }, function (error, userProfile) {
        if (error)
            throw error;
       if(userProfile != null)
        return res.send({ status: 'true', message: "Found userdetail!", data : userProfile });
       else
        return res.send({ status: 'false', message: "Data not found" });
    });
});


router.route('/addUser')
.post(function (req, res) {
    Users.addUser(req.body, function (err, userdetail) {
        if (err)
            res.json(err);
        else {
          return  res.send({ status: 'true', message: 'User created' , data : userdetail});
        }
    });
});


router.route('/getCountry')
.post(function (req, res) {
    Users.getCountry(function (error, countryList) {
        if (error)
            throw error;
       // res.json(userslist);
        return res.send({ status: 'true', message: "Country list found!", data : countryList });
    });
});

module.exports = router;