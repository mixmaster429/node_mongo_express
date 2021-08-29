var EstimateModel = require('../models/estimate');
var User = require('../models/users');
var RoleModel = require('../models/roles');
var FeeHeadModel = require('../models/feeHead');
var TaxModel = require('../models/tax');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');
const { sendMail } = require('./mailUtil');


class estimateController {
    async getBaseData (req, res) {
        let { school_id } = req.headers
        let client = await User.find({ school_id: school_id })
        let project = await FeeHeadModel.find({ school_id: school_id });
        let tax = await TaxModel.find({ school_id: school_id })
        res.json({status: true, result: {
            client: client,
            project: project,
            tax: tax
        }})
    }

    async getEstimates (req, res) {
        try {
            let { school_id } = req.headers
            let estimates = await EstimateModel.find({ school_id: school_id }).populate({path: 'project_id'}).populate({path: 'tax'})
            let clientIds = estimates.map((e)=>e.client)
            let users = await User.find({user_id: {$in: clientIds}})

            let result = []
            estimates.map((e) => {
                let row = JSON.parse(JSON.stringify(e))
                row.client = JSON.stringify(users.find((u)=>u.user_id === row.client))
                row.is_expired = (new Date).valueOf() > (new Date(row.expiry_date)).valueOf()
                result.push(row)
            })
            
            res.json({status: true, result: result})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getEstimate (req, res) {
        try {
            let { id } = req.params
            let estimate = await EstimateModel.findOne({_id: id}).populate({path: 'project_id'}).populate({path: 'tax'})
            let client = await User.findOne({user_id: estimate.client})
            let role = await RoleModel.findOne({_id: client.role_id})
            let result = {}
            result = {...estimate._doc, client, role}

            res.json({status: true, result: result})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createEstimate (req, res) {
        let { user_id, user_name, user_email, school_id } = req.headers;
        let data = req.body
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
            
            data['estimate_number'] = "EST-" + (new Date).getTime()
            data['status'] = 0;
            
            let item = await EstimateModel.create(data);
    
            sendMail(user_id, user_name, {
                to: data.email,
                from: user_email,
                sender: user_name,
                subject: "New Estimate was created",
                html: `<a href="${process.env.SITE_URL}/view/estimate/${item._id}">`
            })
        saveActivity(user_id, user_name, "Estimate", "New Estimate has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateEstimate (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['school_id'] = school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await EstimateModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Estimate", "A Estimate has been updated.", "Updated");
        let estimates = await EstimateModel.find({ school_id: school_id })
        res.json({status: true, result: estimates})
    }

    async deleteEstimate (req, res) {
        let { id } = req.params
        let { user_id, user_name, school_id } = req.headers;
        await EstimateModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Estimate", "An Estimate About has been deleted.", "Deleted");
        let estimates = await EstimateModel.find({ school_id: school_id })
        res.json({status: true, result: estimates})
    }
}

module.exports = estimateController;