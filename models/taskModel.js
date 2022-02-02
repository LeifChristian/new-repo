var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// task collection
var taskSchema = new mongoose.Schema({
    task_networkId: { type: ObjectId,  required: true  },
    task_userId: { type: ObjectId,  required: true  },
    task_title: { type: String, required: true },
    task_discription: { type: String, required: true },
    task_dueDate: { type: Date, required: true },
    task_dueTime: { type: Date, required: true },
    task_createdDateTime: { type: Date, default: Date.now },
});

var task = module.exports = mongoose.model('task', taskSchema);


// task assigned user collection
var taskMemberSchema = new mongoose.Schema({
    task_id: { type: ObjectId,  required: true },
    taskAssignedUser_id: { type: ObjectId,  required: true },
});
var taskMember = module.exports = mongoose.model('taskMember', taskMemberSchema);




// create task
module.exports.addTask = function (taskdata, callback) {
    task.create(taskdata, callback);
}

// add group member
module.exports.addTaskMember = function (taskmember, callback) {
    taskMember.create(taskmember, callback);
}

// get all group
module.exports.getTask = function (user_id, callback) {
   task.aggregate( [

   {
      $lookup:
         {
            from: "taskmembers",
            localField: "_id",
            foreignField: "task_id",
            as: "inventory_docs"
        }
   },{
      $unwind: "$inventory_docs"
   },
   {
        $match :  { $or: [{"inventory_docs.taskAssignedUser_id" : mongoose.Types.ObjectId(user_id)  }, { "task_userId": mongoose.Types.ObjectId(user_id)  }] }

    },
    {"$group" : {_id:"$_id", count:{$sum:1},  "task_title": {$first: "$task_title"}, "task_discription": {$first: "$task_discription"},  "task_dueDate": {$first: "$task_dueDate"},  "task_networkId": {$first: "$task_networkId"} }}
], callback);

}


// get group member
module.exports.getTaskMember = function (task_id, callback) {
   taskMember.aggregate( [ { "$sort" : {_id : -1}  }, {"$match" : {task_id : mongoose.Types.ObjectId(task_id) } } ], callback);
}

// check user detail
module.exports.getTaskDetail = function (task_id, callback) {
    // task.find(query, callback);
    task.aggregate([{"$match" : {_id : mongoose.Types.ObjectId(task_id) } },{ "$lookup": {"localField": "task_userId","from": "users","foreignField": "_id","as": "userinfo"} },{ "$unwind": "$userinfo" }], callback);
}
