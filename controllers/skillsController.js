const SkillModel = require('../models/skill');
const { saveActivity } = require('./activityUtil');



class skillController {

    async addSkill(req, res) {

    let data = req.body;
    let { user_id, user_name, _id } = req.headers;
    data.created_at = Date.now()
    data. created_by = {
        user_id: user_id,
        user_name: user_name
    }
   
    await SkillModel.create(data);
    saveActivity(user_id, user_name, "Skill", "New Skill has been created.", "Created");
    res.json({ status: true });

}

async deleteSkill(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await SkillModel.deleteOne({ _id: id });
    saveActivity(user_id, user_name, "Skill", "An Skill has been deleted.", "Deleted");
    res.json({ status: true });
}


async getSkills(req, res) {

    let { user_id, user_name } = req.headers;
    let result = await SkillModel.find({ "created_by.user_id": user_id });
   
    res.json({ status: true,result });
}

}


module.exports = skillController;