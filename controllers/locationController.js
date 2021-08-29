const LocationModel = require('../models/location');
const {
	saveActivity
} = require('./activityUtil');
const db = require("../db").queries;
class locationController {
	async getLocations(req, res) {
    let { user_id, school_id } = req.headers
    let locations = await LocationModel.find({school_id: school_id})
		res.json({
			status: true,
			result: locations
		});
  }
	async getLocations_old(req, res) {
		let {
			user_id
		} = req.headers
		let match = {
			$match: {
				//role_id: "776425a6489a5dea266da9e928b9fe08", // static for now will change
				// static for now will change
				'created_by.user_id': user_id
			}
		}
		let unwindStates = {};
		let lookUp1 = {};
		let unwindCities = {};
		let lookUp2 = {};
		let unwindCountries = {};
		let lookUp3 = {};
		let addFields1 = {
			"$addFields": {
				"stateObjectId": {
					"$toObjectId": "$state_id"
				}
			}
		}
		let addFields2 = {
			"$addFields": {
				"cityObjectId": {
					"$toObjectId": "$city_id"
				}
			}
		}
		let addFields3 = {
			"$addFields": {
				"countryObjectId": {
					"$toObjectId": "$country_id"
				}
			}
		}
		lookUp1 = {
			$lookup: {
				from: "statemodels",
				localField: "stateObjectId",
				foreignField: "_id",
				as: "statesData"
			}
		};
		unwindStates = {
			$unwind: {
				path: "$statesData",
				preserveNullAndEmptyArrays: true
			}
		};
		lookUp2 = {
			$lookup: {
				from: "citymodels",
				localField: "cityObjectId",
				foreignField: "_id",
				as: "citiesData"
			}
		};
		unwindCities = {
			$unwind: {
				path: "$citiesData",
				preserveNullAndEmptyArrays: true
			}
		};
		lookUp3 = {
			$lookup: {
				from: "countrymodels",
				localField: "countryObjectId",
				foreignField: "_id",
				as: "countriesData"
			}
		};
		unwindCountries = {
			$unwind: {
				path: "$countriesData",
				preserveNullAndEmptyArrays: true
			}
		};
		let project = {
			"$project": {
				"_id": 1,
				"title": 1,
				"address_1": 1,
				//  "session_id":1,
				"address_2": 1,
				"city": 1,
				"country_id": 1,
				"state": 1,
				"max_student": 1,
				//   "standard_grade_id":1,
			}
		}
		let group = {
			$group: {
				_id: "$_id",
				title: {
					$first: "$title"
				},
				address_1: {
					$first: "$address_1"
				},
				address_2: {
					$first: "$address_2"
				},
				city: {
					$first: "$citiesData"
				},
				country_id: {
					$first: "$countriesData"
				},
				state: {
					$first: "$statesData"
				},
				max_student: {
					$first: "$max_student"
				},
			}
		};
		let query = [
			match,
			addFields1,
			lookUp1,
			unwindStates,
			addFields2,
			lookUp2,
			unwindCities,
			addFields3,
			lookUp3,
			unwindCountries,
			group,
			project
		];
		let locations = await db.aggregateData(LocationModel, query)
		res.json({
			status: true,
			result: locations
		});
	}
	async addLocation(req, res) {
		let {
			address_1, address_2, zip_code, description, max_student, title
		} = req.body;
		let {
			user_id, user_name, school_id
		} = req.headers;
		await LocationModel.create({
			created_at: Date.now(),
			created_by: {
				name: user_name,
				user_id: user_id
			},
			school_id: school_id,
			address_1,
			address_2,
			zip_code,
			description,
			max_student,
			title,
			// updated_at,
		});
		saveActivity(user_id, user_name, "Location", "New Location has been created.", "Created");
		res.json({
			status: true
		});
	}
	async getLocation(req, res) {
		let {
			user_id, user_name
		} = req.headers;
		let {
			id
		} = req.params;
		let location = await LocationModel.findOne({
			_id: id
		});
		res.json({
			status: true,
			result: location
		});
	}
	async editLocation(req, res) {
		let {
			id, address_1, address_2, zip_code, description, max_student, title
		} = req.body;
		let {
			user_id, user_name, school_id
		} = req.headers;
		await LocationModel.updateOne({
			_id: id
		}, {
			address_1,
			address_2,
			school_id,
			zip_code,
			description,
			max_student,
			title,
			updated_at: Date.now(),
				updated_by: {
					name: user_name,
					user_id: user_id
				}
		})
		saveActivity(user_id, user_name, "Location", "A Location has been edited.", "Updated");
		res.json({
			status: true
		});
	}
	async deleteLocation(req, res) {
		let {
			id
		} = req.params;
		let {
			user_id, user_name
		} = req.headers;
		await LocationModel.deleteOne({
			_id: id
		});
		saveActivity(user_id, user_name, "Location", "An Location has been deleted.", "Deleted");
		res.json({
			status: true
		});
	}
}
module.exports = locationController;