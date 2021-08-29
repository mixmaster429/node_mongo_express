var mongoose = require('mongoose');

 var schema = mongoose.Schema({
     id: String,
     user_id: String,
     user_name: String,
     mobileNo: String,
     status: String,
     statusMessage: String,
     sendDate: Date
 });

 module.exports = mongoose.model("SmsLogsModel", schema);