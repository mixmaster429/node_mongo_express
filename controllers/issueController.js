const IssueModel = require('../models/issue');
const CommnetModel = require('../models/comment');
const User = require('../models/users');
const { saveActivity } = require('./activityUtil');

const crypto = require('crypto');

class issueController {

    async getIssues(req, res) {
        let Issues = await IssueModel.find({}).populate({path :"issue_id"});
        res.json({ status: true, result: Issues });
    }

    async addIssue(req, res) {
        let data = req.body;
        let { user_id, user_name } = req.headers;
        data['created_at'] =  Date.now()
        data['created_by']= {
            name: user_name,
            user_id: user_id
        }

        data['user_id'] = user_id
        
        await IssueModel.create(data);
        saveActivity(user_id, user_name, "Issue", "New Issue has been created.", "Created");
        res.json({ status: true });
    }

    
    async getIssue(req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let location = await IssueModel.findOne({ _id: id }).populate({path :"issue_id"});
        res.json({ status: true, result: location });
    }

    async editIssue(req, res) {
        let id = req.body.id;
        let data = req.body;
        delete data['id']
        let { user_id, user_name } = req.headers;
        await IssueModel.updateOne(
            { _id: id },data);
        saveActivity(user_id, user_name, "Issue", "A Issue has been edited.", "Updated");
        res.json({ status: true });

    }

    async deleteIssue(req, res) {
        let { id } = req.params;
        let { user_id, user_name } = req.headers;
        await IssueModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Issue", "A Leacture has been deleted.", "Deleted");
        res.json({ status: true });
    }

    async changeStatus(req, res) {
        let {id, status} = req.body;
        await IssueModel.updateOne({_id: id}, {status: status})
        let { user_id, user_name } = req.headers;
        saveActivity(user_id, user_name, "Issue", "Status field of Issue has been changed.", "Updated");
        res.json({ status: true });
    }

    async addComment(req, res) {
        let data = req.body;
        let { user_id, user_name } = req.headers;
        let user = await User.findOne({user_id, user_id})
        console.log(user._doc)
        data['user_id'] = user_id
        data['user'] = user._doc
        data['created_at'] =  Date.now()
        data['updated_at'] =  Date.now()
        data['created_by']= {
            name: user_name,
            user_id: user_id
        }
        data['updated_by']= {
            name: user_name,
            user_id: user_id
        }
        
        await CommnetModel.create(data);
        saveActivity(user_id, user_name, "Comment", "New Comment has been created.", "Created");
        res.json({ status: true });
    }

}

module.exports = issueController;