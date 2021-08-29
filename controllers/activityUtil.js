const ActivityLogsModel = require('../models/activityLogs');
const RoleModel = require('../models/roles');
const User = require('../models/users');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

async function saveActivity(user_id, user_name, module_name, description,log_name) {
    await ActivityLogsModel.create({
        user_id,
        user_name,
        logged_at: Date.now(),
        module_name,
        description,
        log_name
    })
    return;
}

async function getDateRange(startDate, endDate, days) {
  //  const start = new Date("11/30/2018"), end = new Date("09/30/2019")
    const range = moment.range(moment(startDate), moment(endDate));

   
    let response  = []
    var arr =  Array.from(range.by('day'))
    var result = arr.map(date=>{
      //  console.log(days.includes(moment(date).format('dddd')))
      if(days.includes(moment(date).format('dddd'))){
        response.push({day:moment(date).format('dddd'),date,content:''})
      }
        
    })
    console.log(response)
    return response

};

async function getActivities(req) {
    let { user_role, user_id, school_id } = req.headers
    let role = await RoleModel.findOne({ $or: [{_id: user_role}, {id: user_role}] });
    if (role) {
        if (role.weight === 0) {
            let users = (await User.find({role_id: {$in: [1, 3]}}).select('user_id')).map((item)=>item.user_id);
            users.push(user_id)
            let activities = await ActivityLogsModel.find({user_id: {$in: users}}).sort({logged_at: -1}).limit(1000);
            return activities;
        } else if (role.weight <= 3) {
            let roles = (await RoleModel.find({ weight: {$gt: role.weight}, school_id: school_id }).select('_id')).map((item)=> item._id);
            let users = (await User.find({ role_id: {$in: roles}, school_id: school_id }).select('user_id')).map((item)=>item.user_id);
            users.push(user_id)
            let activities = await ActivityLogsModel.find({user_id: {$in: users}}).sort({logged_at: -1}).limit(1000);
            return activities;
        } else if (!isNaN(role.weight + 1)) {
            let roles = (await RoleModel.find({ weight: (role.weight+1) , school_id: school_id }).select('_id')).map((item)=> item._id);
            let users = (await User.find({ role_id: {$in: roles}, school_id: school_id }).select('user_id')).map((item)=>item.user_id);
            users.push(user_id)
            let activities = await ActivityLogsModel.find({user_id: {$in: users}}).sort({logged_at: -1}).limit(1000);
            return activities;
        }
    }
    return []
}

module.exports = { saveActivity, getActivities,getDateRange };