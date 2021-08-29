var FeeHeadModel = require('../models/feeHead');
var Users = require('../models/users');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class feeHeadController {
    async getHeads (req, res) {
        let { school_id } = req.headers
        let heads = await FeeHeadModel.find({ school_id: school_id })
        res.json({status: true, result: heads})
    }

    async createHead (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let data = req.body
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await FeeHeadModel.create(data);
        saveActivity(user_id, user_name, "Fee Head", "New Fee Head has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateHead (req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        if(id === 'bulk') {
            let data = req.body
            
            data.map(async (item)=>{
                item['updated_at'] = Date.now();
                item['updated_by'] =  {
                        name: user_name,
                        user_id: user_id
                    };
                
                await FeeHeadModel.updateOne({_id: item._id}, item);
            })
            saveActivity(user_id, user_name, "Fee Head", "some Fee Heads has been updated.", "Updated");
        } else {
            let data = req.body
            data['updated_at'] = Date.now();
            data['updated_by'] =  {
                    name: user_name,
                    user_id: user_id
                };
             
            await FeeHeadModel.updateOne({_id: id}, data);
            saveActivity(user_id, user_name, "Fee Head", "A Fee Head has been updated.", "Updated");
        }
        let heads = await FeeHeadModel.find({})
        res.json({status: true, result: heads})
    }

    async deleteHead (req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await FeeHeadModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Fee Head", "An Fee Head About has been deleted.", "Deleted");
        let heads = await FeeHeadModel.find({ school_id: school_id })
        res.json({status: true, result: heads})
    }
}

module.exports = feeHeadController;