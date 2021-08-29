var SchoolGradesModel = require('../models/schoolGrades');
var Users = require('../models/users');
var MaterialModel = require('../models/material');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class materialController {
    async getBaseData (req, res) {
        let { user_id, school_id } = req.headers
        console.log(user_id);
        let grades = await SchoolGradesModel.find({school_id: school_id})
        res.json({status: true, result: {
            grades: grades
        }})
    }

    async getMaterials (req, res) {
        try {
            let { school_id } = req.headers
            let materials = await MaterialModel.find({school_id: school_id})
                        .populate('grade_id', ['name', 'position'])

            res.json({status: true, result: {
                materials: materials,
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getMaterial (req, res) {
        try {
            let { id } = req.params
            let material = await MaterialModel.findOne({_id: id})

            res.json({status: true, result: material})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createMaterial (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let data = req.body
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await MaterialModel.create(data);
        saveActivity(user_id, user_name, "Material", "New Material has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateMaterial (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['school_id'] = school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await MaterialModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Material", "A Material has been updated.", "Updated");
        let materials = await MaterialModel.find({school_id: school_id})
        res.json({status: true, result: materials})
    }

    async deleteMaterial (req, res) {
        let { id } = req.params
        let { user_id, user_name, school_id } = req.headers;
        await MaterialModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Material", "An Material About has been deleted.", "Deleted");
        let materials = await MaterialModel.find({school_id: school_id})
        res.json({status: true, result: materials})
    }
}

module.exports = materialController;