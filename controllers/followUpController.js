const FollowUpModel = require('../models/followUp');
const { saveActivity } = require('./activityUtil');
const db = require("../db").queries;


class followUpController {
    async deleteFollowUp(req, res) {
        let { id } = req.params;
        let { user_id, user_name } = req.headers;
        await FollowUpModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "FollowUp", "A FollowUp has been deleted.", "Deleted");
        res.json({ status: true });
    }

    async getFollowUp(req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let followUpObj = await FollowUpModel.findOne({ _id: id });
        res.json({ status: true, result: followUpObj });
    }
    async getStudentFollowUps(req, res) {
        let { user_id, user_name } = req.headers;
        let { student_id } = req.params;
        let followUps = await FollowUpModel.find({ student_id: student_id });
        res.json({ status: true, result: followUps });
    }
    
    async addFollowUp(req,res){
        let data = req.body;
        let { user_id, user_name, school_id } = req.headers;
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await FollowUpModel.create(data);
        saveActivity(user_id, user_name, "FollowUp", "New FollowUp has been created.", "Created");
        res.json({ status: true });
    }
    async editFollowUp(req, res) {
        let id = req.body.id;
        let data = req.body;
        delete data['id']
        let { user_id, user_name } = req.headers;
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: req.headers.user_name,
                user_id: req.headers.user_id
            };
        
        
       
        await FollowUpModel.updateOne( { _id: id },
           { $set:data }
        );
        saveActivity(user_id, user_name, "FollowUp", "A FollowUp has been edited.", "Updated");
        res.json({ status: true });
    }

}



module.exports = followUpController;