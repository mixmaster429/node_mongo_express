var FeeGroupModel = require('../models/feeGroup');
var Users = require('../models/users');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class feeGroupController {
    async getGroups (req, res) {
        let { user_id } = req.headers
        let groups = await FeeGroupModel.find({'created_by.user_id': user_id})
        res.json({status: true, result: groups})
    }

    async createGroup (req, res) {
        let { user_id, user_name } = req.headers;
        let data = req.body
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await FeeGroupModel.create(data);
        saveActivity(user_id, user_name, "Fee Group", "New Fee Group has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateGroup (req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await FeeGroupModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Fee Group", "A Fee Group has been updated.", "Updated");
        let groups = await FeeGroupModel.find({})
        res.json({status: true, result: groups})
    }

    async deleteGroup (req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await FeeGroupModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Fee Group", "An Fee Group About has been deleted.", "Deleted");
        let groups = await FeeGroupModel.find({})
        res.json({status: true, result: groups})
    }
}

module.exports = feeGroupController;