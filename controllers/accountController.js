var AccountModel = require('../models/account');
var TransactionModel = require('../models/transaction');
const { saveActivity } = require('./activityUtil');

class AccountController {
    async getAccounts (req, res) {
        let { school_id } = req.headers
        let accounts = await AccountModel.find({school_id: school_id})

        res.json({status: true, result: accounts})
    }

    async getAccount (req, res) {
        let { user_id } = req.headers
        let account = await AccountModel.findOne({user_id: user_id})

        res.json({status: true, result: account})
    }

    async registerAccount(req, res) {
        let { user_id, user_name, school_id } = req.headers
        let account = await AccountModel.countDocuments({user_id: user_id})
        let data = req.body
        data['user_id'] = user_id
        data['school_id'] = school_id
        if(account > 0) {
            data['updated_at'] = Date.now();
            data['updated_by'] =  {
                    name: user_name,
                    user_id: user_id
                };
            
            let item = await AccountModel.updateOne({user_id: user_id}, data);

            saveActivity(user_id, user_name, "Account", "A Account has been updated.", "Updated");
            res.json({ status: true, result: item});
        } else {
            data['created_at'] = Date.now();
            data['created_by'] =  {
                    name: user_name,
                    user_id: user_id
                };
            
            let item = await AccountModel.create(data);

            saveActivity(user_id, user_name, "Account", "New Account has been created.", "Created");
            res.json({ status: true, result: item});
        }
    }

    async deleteAccount(req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await AccountModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Account", "An Account About has been deleted.", "Deleted");
        let accounts = await AccountModel.find({})
        res.json({status: true, result: accounts})
    }

    async getTransactions(req, res) {
        let { user_id } = req.headers
        
        let transactions = await TransactionModel.find({seller: user_id})

        res.json({status: true, result: transactions})
    }
}

module.exports = AccountController;