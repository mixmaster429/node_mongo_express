var PolicyModel = require('../models/policy');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class policyController {
    async getBaseData (req, res) {
        
        res.json({status: true, result: {
            
        }})
    }

    async getPolicies (req, res) {
        try {
            let { user_id,owner_id } = req.headers
            let policies = await PolicyModel.find({'created_by.user_id': {$in: [user_id]}})

            res.json({status: true, result: {
                policies: policies,
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getPolicy (req, res) {
        try {
            let { id } = req.params
            let policy = await PolicyModel.findOne({_id: id})

            res.json({status: true, result: policy})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createPolicy (req, res) {
        let { user_id, user_name } = req.headers;
        let data = req.body
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await PolicyModel.create(data);
        saveActivity(user_id, user_name, "Policy", "New Policy has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updatePolicy (req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await PolicyModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Policy", "A Policy has been updated.", "Updated");
        let policies = await PolicyModel.find({})
        res.json({status: true, result: policies})
    }

    async deletePolicy (req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await PolicyModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Policy", "An Policy About has been deleted.", "Deleted");
        let policies = await PolicyModel.find({})
        res.json({status: true, result: policies})
    }
}

module.exports = policyController;