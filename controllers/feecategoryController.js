var FeeCategoryModel = require('../models/feeCategory');
var Users = require('../models/users');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class feeCategoryController {
    async getCategories (req, res) {
        let { school_id } = req.headers
        let categories = await FeeCategoryModel.find({ school_id: school_id })
        res.json({status: true, result: categories})
    }

    async createCategory (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let data = req.body;
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await FeeCategoryModel.create(data);
        saveActivity(user_id, user_name, "Fee Category", "New Fee Category has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateCategory (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await FeeCategoryModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Fee Category", "A Fee Category has been updated.", "Updated");
        let categories = await FeeCategoryModel.find({ school_id: school_id })
        res.json({status: true, result: categories})
    }

    async deleteCategory (req, res) {
        let { id } = req.params
        let { user_id, user_name, school_id } = req.headers;
        await FeeCategoryModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Fee Category", "An Fee Category About has been deleted.", "Deleted");
        let categories = await FeeCategoryModel.find({ school_id: school_id })
        res.json({status: true, result: categories})
    }
}

module.exports = feeCategoryController;