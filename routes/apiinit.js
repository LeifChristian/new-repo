﻿var user 	= require('./users');
var network = require('./network');
var admin 	= require('./admin');
var mail = require('./mail');
var post = require('./post');
var invite = require('./invite');
var comment = require('./comment');
var deskPost = require('./deskPost');
var networkGroup = require('./networkGroup');
var task = require('./task');
var networkMedia = require('./networkMedia');

module.exports = function (app) {

    app.use('/api/user', user);
    app.use('/api/network', network);
    app.use('/api/admin', admin);
    app.use('/api/mail', mail);
    app.use('/api/post', post);
    app.use('/api/invite', invite);
    app.use('/api/comment', comment);
    app.use('/api/deskPost', deskPost);
    app.use('/api/networkGroup', networkGroup);
    app.use('/api/task', task);
    app.use('/api/networkMedia', networkMedia);
};
