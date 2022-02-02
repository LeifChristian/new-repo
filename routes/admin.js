var express = require('express');
var router = express.Router();
var Admin = require('../models/adminmodel');
var request = require('request');

router.route('/subadminList')
.post(function (req, res) {
    Admin.subadminList({admin_role : "2" }, function (error, list) {
        if (error)
            throw error;
        if(list.length > 0)
          return res.send({ status: 'true', message: "data found!", data : list });
        else
         return res.send({ status: 'true', message: "data not found!"});
    });
});

router.route('/addSubadmin')
.post(function (req, res) {
    req.body.admin_role = "2";
    req.body.admin_status = '1';
    Admin.checkUserExist({ admin_email : req.body.admin_email }, function (err, userDetail) {
        if(userDetail.length > 0){
            return res.send({ status: 'false', message: "Subadmin already exist!"});
        }else{
            Admin.addSubadmin(req.body, function (err, list) {
                if (err)
                    res.json(err);
                else {
                    return res.send({ status: 'true', message: "Subadmin added successfully!", data : list });
                }
            });
        }
    });
});


router.route('/login')
.post(function (req, res) {

    Admin.login( { $and : [  { admin_email : req.body.admin_email }, {  admin_password : req.body.admin_password }, {  admin_role : '1' } ] } , function (err, adminData) {
        if (err)
            return res.json(err);
        else {
            if(adminData.length > 0){

                return  res.send({ status: 'true', message: 'Login Successfully completed !' , data : adminData});

            }else{

              Admin.login( { $and : [  { admin_email : req.body.admin_email }, {  admin_password : req.body.admin_password }, { admin_status : '1' }, { admin_role : '2' } ] } , function (err, isActive) {
                  if (err)
                      res.json(err);
                  else {
                      if(isActive.length > 0){
                        return  res.send({ status: 'true', message: 'Login Successfully completed !' , data : isActive});
                      }else{
                         return  res.send({ status: 'false', message: 'Username or password not matched!'});
                      }
                  }
              });


            }

        }
    });

});

router.route('/changePassword')
.post(function (req, res) {

  if(req.body.new_password != req.body.new_confirm_password ){
    return res.send({ status: 'false', message: "Password not matched!"});
  }

  Admin.checkUserExist({ $and : [  { _id : req.body._id }, {  admin_password : req.body.old_password } ] }, function (err, userDetail) {
        if(userDetail.length == 0){
            return res.send({ status: 'false', message: "Old password no matched!"});
        }else{
          Admin.changePassword(  {  _id : req.body._id  }, { admin_password : req.body.new_password  } , function (err, updatePass) {
              if (err)
                     return res.json(err);
              else {
                  if(updatePass != null){
                     return  res.send({ status: 'true', message: 'Password changed!' , data : updatePass});
                  }else{
                     return  res.send({ status: 'false', message: 'Login not success'});
                  }
              }
          });
        }
    });
});


router.route('/subadminchangePassword')
.post(function (req, res) {
  if(req.body.new_password != req.body.new_confirm_password ){
    return res.send({ status: 'false', message: "Password not matched!"});
    }
    Admin.changePassword(  {  _id : req.body._id  }, { admin_password : req.body.new_password  } , function (err, updatePass) {
              if (err)
                  res.json(err);
              else {
                  if(updatePass != null){
                    return  res.send({ status: 'true', message: 'Password changed!' , data : updatePass});
                  }else{
                     return  res.send({ status: 'false', message: 'Login not success'});
                  }
              }
     });
});


router.route('/adminChangeStatus')
.post(function (req, res) {
     var msg = '';
     if(req.body.status == 0)
        msg = 'Now subadmin inctive';
      else
        msg = 'Now subadmin active';
     Admin.adminChangeStatus({ _id : req.body._id }, { admin_status : req.body.status }, function (err, isActive) {
                  if (err)
                      res.json(err);
                  else {
                        Admin.subadminList({ _id : req.body._id }, function (error, list) {
                          if (error)
                              throw error;
                          return  res.send({ status: 'true', message: msg , data : list});
                      });
               }
      });

});


router.route('/getSubadminDetail')
.post(function (req, res) {
    Admin.getSubadminDetail(  {  _id : req.body._id  } , function (err, detail) {
              if (err)
                  res.json(err);
              else {
                  if(detail != null){
                    return  res.send({ status: 'true', message: 'Data found!', data : detail});
                  }else{
                     return  res.send({ status: 'false', message: 'Data not found!'});
                }
           }
     });
});


router.route('/updateSubadmin')
.post(function (req, res) {

  Admin.checkUserExist( { $and : [ { admin_email : req.body.admin_email }, { _id : { $ne : req.body._id }  } ] }, function (err, userDetail) {

        if(userDetail.length > 0){
            return res.send({ status: 'false', message: "Email id already exist"});
        }else{

        Admin.updateSubadmin(  {  _id : req.body._id  }, req.body, function (err, isUpdate) {
                  if (err)
                      res.json(err);
                  else {
                       Admin.subadminList({ _id : req.body._id }, function (error, list) {
                          if (error)
                              throw error;
                          return  res.send({ status: 'true', message: 'Update successfully completed!' , data : list});
                    });

                }
           });
         }
    });

});

module.exports = router;
