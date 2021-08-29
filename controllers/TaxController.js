var TaxModel = require('../models/tax');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class taxController {
    async getBaseData (req, res) {
        
        res.json({status: true, result: {
            
        }})
    }

    async getTaxes (req, res) {
        try {
            let { school_id } = req.headers
            let taxes = await TaxModel.find({ school_id: school_id })

            res.json({status: true, result: {
                taxes: taxes,
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }
 
    async getTax (req, res) {
        try {
            let { id } = req.params
            let tax = await TaxModel.findOne({_id: id})

            res.json({status: true, result: tax})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createTax (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let data = req.body
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await TaxModel.create(data);
        saveActivity(user_id, user_name, "Tax", "New Tax has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateTax (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['school_id'] = school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await TaxModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Tax", "A Tax has been updated.", "Updated");
        let taxes = await TaxModel.find({ school_id: school_id })
        res.json({status: true, result: taxes})
    }

    async deleteTax (req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await TaxModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Tax", "An Tax About has been deleted.", "Deleted");
        let taxes = await TaxModel.find({ school_id: school_id })
        res.json({status: true, result: taxes})
    }
}

module.exports = taxController;