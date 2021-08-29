var PayrollItemModel = require('../models/payrollItem');
var User = require('../models/users');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class payrollItemController {
    async getBaseData (req, res) {
        
        res.json({status: true, result: {
            
        }})
    }

    async getPayrollItems (req, res) {
        try {
            let { user_id,owner_id } = req.headers
            let payrollItems = await PayrollItemModel.find({'created_by.user_id': {$in: [user_id]}})
            let users = await User.find({'created_by.user_id': user_id/* , role_id: {$in: roles} */})

            res.json({status: true, result: {
                payrollItems: payrollItems,
                users: users
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getPayrollItem (req, res) {
        try {
            let { id } = req.params
            let payrollItem = await PayrollItemModel.findOne({_id: id})

            res.json({status: true, result: payrollItem})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createPayrollItem (req, res) {
        let { user_id, user_name } = req.headers;
        let data = {}
        let { type } = req.params
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
        data['type'] = type
        data['item'] = req.body
        let item = await PayrollItemModel.create(data);
        saveActivity(user_id, user_name, "PayrollItem", "New PayrollItem has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updatePayrollItem (req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let data = {}
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
        data['item'] = req.body
         
        await PayrollItemModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "PayrollItem", "A PayrollItem has been updated.", "Updated");
        let payrollItems = await PayrollItemModel.find({})
        res.json({status: true, result: payrollItems})
    }

    async deletePayrollItem (req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await PayrollItemModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "PayrollItem", "An PayrollItem About has been deleted.", "Deleted");
        let payrollItems = await PayrollItemModel.find({})
        res.json({status: true, result: payrollItems})
    }
}

module.exports = payrollItemController;