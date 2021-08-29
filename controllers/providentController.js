var ProvidentModel = require('../models/provident');
var User = require('../models/users');
var RoleModel = require('../models/roles');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class providentController {
    async getBaseData (req, res) {
        
        res.json({status: true, result: {
            
        }})
    }

    async getProvidents (req, res) {
        try {
            let { user_id,owner_id } = req.headers
            let providents = await ProvidentModel.find({'created_by.user_id': {$in: [user_id]}})
            let roles  = (await  RoleModel.find({weight:{$in: [5, 6]} /* ,"created_by.user_id":user_id */}).select('_id')).map((item)=>item._id)
            let employees = await User.find({'created_by.user_id': user_id , role_id: {$in: roles}})

            res.json({status: true, result: {
                providents: providents,
                employees: employees
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getProvident (req, res) {
        try {
            let { id } = req.params
            let provident = await ProvidentModel.findOne({_id: id})

            res.json({status: true, result: provident})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createProvident (req, res) {
        let { user_id, user_name } = req.headers;
        let data = req.body
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await ProvidentModel.create(data);
        saveActivity(user_id, user_name, "Provident", "New Provident has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateProvident (req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await ProvidentModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Provident", "A Provident has been updated.", "Updated");
        let providents = await ProvidentModel.find({})
        res.json({status: true, result: providents})
    }

    async deleteProvident (req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await ProvidentModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Provident", "An Provident About has been deleted.", "Deleted");
        let providents = await ProvidentModel.find({})
        res.json({status: true, result: providents})
    }
}

module.exports = providentController;