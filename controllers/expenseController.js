var ExpenseModel = require('../models/expense');
var User = require('../models/users');
var RoleModel = require('../models/roles');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class expenseController {
    async getBaseData (req, res) {
        
        res.json({status: true, result: {
            
        }})
    }

    async getExpenses (req, res) {
        try {
            let { school_id } = req.headers
            let expenses = await ExpenseModel.find({ school_id: school_id });
            let roles  = (await RoleModel.find({ weight:{$in: [5, 6]}, school_id: school_id }).select('_id')).map((item)=>item._id)
            let client = await User.find({ school_id: school_id , role_id: {$in: roles}})

            res.json({status: true, result: {
                expenses: expenses,
                client: client
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getExpense (req, res) {
        try {
            let { id } = req.params
            let expense = await ExpenseModel.findOne({_id: id})

            res.json({status: true, result: expense})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createExpense (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let data = req.body
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await ExpenseModel.create(data);
        saveActivity(user_id, user_name, "Expense", "New Expense has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateExpense (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['school_id'] =  school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await ExpenseModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Expense", "A Expense has been updated.", "Updated");
        let expenses = await ExpenseModel.find({ school_id: school_id })
        res.json({status: true, result: expenses})
    }

    async deleteExpense (req, res) {
        let { id } = req.params
        let { user_id, user_name, school_id } = req.headers;
        await ExpenseModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Expense", "An Expense About has been deleted.", "Deleted");
        let expenses = await ExpenseModel.find({ school_id: school_id })
        res.json({status: true, result: expenses})
    }
}

module.exports = expenseController;