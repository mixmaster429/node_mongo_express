var PayrollSalaryModel = require('../models/payrollSalary');
var User = require('../models/users');
var RoleModel = require('../models/roles');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');
const payrollSalary = require('../models/payrollSalary');


class PayrollSalaryController {
    async getBaseData (req, res) {
        
        res.json({status: true, result: {
            
        }})
    }

    async getPayrollSalaries (req, res) {
        try {
            let { user_id,owner_id } = req.headers
            let payrollSalaris = await PayrollSalaryModel.find({'created_by.user_id': {$in: [user_id]}})
            let users = await User.find({})
            let roles = await RoleModel.find({})

            res.json({status: true, result: {
                payrollSalaris: payrollSalaris,
                users: users,
                roles: roles
            }})
        } catch (e) {
            console.log(e)
            res.json({status: false, error: "Getting error"})
        }
    }

    async getPayrollSalary (req, res) {
        try {
            let { id } = req.params
            let result = {};
            let PayrollSalary = await PayrollSalaryModel.findOne({_id: id})
            let client = await User.findOne({user_id: PayrollSalary.staff_id})
            let role = await RoleModel.findOne({_id: client.role_id})
            result = {...PayrollSalary._doc, client, role}
            
            res.json({status: true, result: result})
        } catch (e) {
            console.log(e)
            res.json({status: false, error: "Getting error"})
        }
    }

    async createPayrollSalary (req, res) {
        let { user_id, user_name } = req.headers;
        let data = req.body
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await PayrollSalaryModel.create(data);
        saveActivity(user_id, user_name, "PayrollSalary", "New PayrollSalary has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updatePayrollSalary (req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await PayrollSalaryModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "PayrollSalary", "A PayrollSalary has been updated.", "Updated");
        let PayrollSalaris = await PayrollSalaryModel.find({})
        res.json({status: true, result: PayrollSalaris})
    }

    async deletePayrollSalary (req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await PayrollSalaryModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "PayrollSalary", "An PayrollSalary About has been deleted.", "Deleted");
        let PayrollSalaris = await PayrollSalaryModel.find({})
        res.json({status: true, result: PayrollSalaris})
    }
}

module.exports = PayrollSalaryController;