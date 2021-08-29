const CurriculumModel = require('../models/curriculum');
const {
    saveActivity
} = require('./activityUtil');

class curriculumTemplateController {
    async getCurriculumTemplates(req, res) {
        let {
            school_id
        } = req.headers;
        let curriculumTemplates = await CurriculumModel.find({
            school_id: school_id
        });
        res.json({
            status: true,
            result: curriculumTemplates
        });
    }

    async addCurriculumTemplate(req, res) {
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        let data = req.body;
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] = {
            name: user_name,
            user_id: user_id
        };
        data['user_id'] = user_id
        await CurriculumModel.create(data);
        saveActivity(user_id, user_name, "Curriculum Template", "New Curriculum Template has been created.", "Created");
        res.json({
            status: true
        });
    }

    async getCurriculumTemplate(req, res) {
        let {
            id
        } = req.params;
        let curriculumObj = await CurriculumModel.findOne({
            _id: id
        });
        res.json({
            status: true,
            result: curriculumObj
        });
    }

    async editCurriculumTemplate(req, res) {
        let id = req.body.id;
        let data = req.body;
        delete data['id']
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        data['school_id'] = school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] = {
            name: req.headers.user_name,
            user_id: req.headers.user_id
        };

        await CurriculumModel.updateOne({
            _id: id
        }, data);
        saveActivity(user_id, user_name, "Curriculum Template", "A Curriculum Template has been edited.", "Updated");
        res.json({
            status: true
        });
    }

    async deleteCurriculumTemplate(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        await CurriculumModel.deleteOne({
            _id: id
        });
        saveActivity(user_id, user_name, "Curriculum Template", "A Curriculum Template has been deleted.", "Deleted");
        res.json({
            status: true
        });
    }


}

module.exports = curriculumTemplateController;