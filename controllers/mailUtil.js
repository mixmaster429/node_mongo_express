const nodemailer = require("nodemailer");
const EmailConfigModel = require('../models/emailConfig');
const EmailLogsModel = require('../models/emailLogs');
const User = require('../models/users');
const RoleModel = require('../models/roles');

async function sendMail(user_id, user_name, msg) {
    const user = await User.findOne({ email: msg.to });
    const role = await RoleModel.findOne({ id: user.role_id });
    let filterOption = {};
    if (role.name !== "Super Admin") {
        filterOption = { user_id: user_id };
    }
    const result = await EmailConfigModel.find(filterOption);
    let emailConfig = {};
    if (result && result.length) {
        emailConfig = result[0];
    } else {
        const result = await EmailConfigModel.find({});
        emailConfig = result[0];
    }

    const { hostName, port, userName, password, senderMail } = emailConfig;

    const transportSettings = {
        "host": hostName,
        "port": port,
        "secure": false,
        "auth": {
            "type": "login",
            "user": userName,
            "pass": password
        }
    };
    
    let transport = nodemailer.createTransport(transportSettings);
    
    return new Promise((resolve, reject) => {
        transport.sendMail(msg, function (err, info) {
            const emailLog = {
                from: senderMail?senderMail:msg.from,
                to: msg.to,
                status: "success",
                subject: msg.subject,
                errorMessage: "No Errors.",
                sendDate: new Date()
            };
            if (err) {
                console.error(err);
                emailLog.status = "failure";
                emailLog.errorMessage = err;
                saveEmailLogs(user_id, user_name, emailLog);
                reject(err);
            } else {
                saveEmailLogs(user_id, user_name, emailLog);
                resolve(info)
            }
        });
    })
}

async function saveEmailLogs(user_id, user_name, emailLog) {
    await EmailLogsModel.create({
        user_id,
        user_name,
        ...emailLog
    });
    return;
}

async function getEmailLogs(req) {
    let { user_role, user_id, school_id } = req.headers
    let role = await RoleModel.findOne({ $or: [{_id: user_role}, {id: user_role}] });
    if (role) {
        if (role.weight === 0) {
            let users = (await User.find({role_id: {$in: [2, 3]}}).select('user_id')).map((item)=>item.user_id);
            users.push(user_id)
            let emailLogs = await EmailLogsModel.find({user_id: {$in: users}}).sort({sendDate: -1}).limit(1000);
            return emailLogs;
        } else if (role.weight <= 3) {
            let roles = (await RoleModel.find({weight: {$gt: role.weight}, school_id: school_id }).select('_id')).map((item)=> item._id);
            let users = (await User.find({role_id: {$in: roles}, school_id: school_id }).select('user_id')).map((item)=>item.user_id);
            users.push(user_id)
            let emailLogs = await EmailLogsModel.find({user_id: {$in: users}}).sort({sendDate: -1}).limit(1000);
            return emailLogs;
        } else if (!isNaN(role.weight + 1)) {
            let roles = (await RoleModel.find({weight: (role.weight+1) , school_id: school_id }).select('_id')).map((item)=> item._id);
            let users = (await User.find({role_id: {$in: roles}, school_id: school_id }).select('user_id')).map((item)=>item.user_id);
            users.push(user_id)
            let emailLogs = await EmailLogsModel.find({user_id: {$in: users}}).sort({sendDate: -1}).limit(1000);
            return emailLogs;
        }
    }
}

module.exports = { sendMail, getEmailLogs };