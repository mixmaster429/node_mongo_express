const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(twilioAccountSid, twilioAuthToken);
const SmsLogsModel = require('../models/smsLogs');
const User = require('../models/users');
const RoleModel = require('../models/roles');

async function sendSMS(sms) {
  return new Promise((resolve, reject) => {
    client.messages
      .create(sms)
      .then((message) => {
        console.log(message.sid);
        resolve(message);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

async function saveSMSLogs(user_id, user_name, smsLog) {
  await SmsLogsModel.create({
    user_id,
    user_name,
    ...smsLog,
  });
  return;
}

module.exports = { sendSMS };
