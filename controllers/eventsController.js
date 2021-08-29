const crypto = require('crypto');
const { saveActivity } = require('./activityUtil');
const eventsModel = require('../models/events');
const eventRegistrationModel = require('../models/eventRegistration');
const eventGalleryModel = require('../models/eventGallery');
const galleryAlbumModel = require('../models/galleryAlbum');

class eventsController {
    constructor() { }

    async addEvent(req, res) {
        try {
            let { user_id, user_name, school_id } = req.headers;
            let { data } = req.body;
            await eventsModel.create({
                // id: crypto.randomBytes(16).toString("hex"),
                user_id: user_id,
                access: data.access,
                for_parent: data.for_parent,
                for_student: data.for_student,
                title: data.title,
                start_date: data.start_date,
                end_date: data.end_date,
                address1: data.address1,
                school_id: school_id,
                zipcode: data.zipcode,
                content: data.content,
                notes: data.notes,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Event", "New Event has been created.", "Created");
            res.json({ status: true });
        } catch (error) {
            res.json({ status: false, message: 'Server Error.' });
        }
    }

    async getEvents(req, res) {
        let { user_id, school_id } = req.headers;
        let events = await eventsModel.find({ school_id: school_id });
        res.json({ status: true, result: events });
    }

    async getEvent(req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let event = await eventsModel.findOne({ _id: id });
        res.json({ status: true, result: event });
    }

    async editEvent(req, res) {
        try {
            let { user_id, user_name, school_id } = req.headers;
            let { data, id } = req.body;
            await eventsModel.updateOne({
                _id: id
            }, {
                access: data.access,
                for_parent: data.for_parent,
                for_student: data.for_student,
                title: data.title,
                start_date: data.start_date,
                end_date: data.end_date,
                address1: data.address1,
                school_id: school_id,
                zipcode: data.zipcode,
                content: data.content,
                notes: data.notes,
                updated_at: Date.now(),
                updated_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Event", "An Event has been updated.", "updated");
            res.json({ status: true });
        } catch (error) {
            res.json({ status: false, message: 'Server Error' });
        }
    }

    async deleteEvent(req, res) {
        let { id } = req.params;
        let { user_name, user_id } = req.headers;
        await eventsModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Event", "An Event has been updated.", "updated");
        res.json({ status: true });
    }

    async addRegistration(req, res) {
        try {
            let { user_id, user_name } = req.headers;
            let { data } = req.body;
            await eventRegistrationModel.create({
                // id: crypto.randomBytes(16).toString("hex"),
                user_id: user_id,
                event_id: data.event_id,
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                message: data.message,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Event", "New Event Registration has been created.", "Created");
            res.json({ status: true });
        } catch (error) {
            res.json({ status: false, message: 'Server Error.' });
        }
    }

    async getRegistrations(req, res) {
        let { user_id, user_name } = req.headers;
        let result = await eventRegistrationModel.find({ user_id: user_id });
        res.json({ status: true, result: result });
    }

    async getRegistration(req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let result = await eventRegistrationModel.findOne({ _id: id });
        res.json({ status: true, result: result });
    }

    async editRegistration(req, res) {
        try {
            let { user_id, user_name } = req.headers;
            let { data, id } = req.body;
            await eventRegistrationModel.updateOne({
                _id: id
            }, {
                event_id: data.event_id,
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                message: data.message,
                updated_at: Date.now(),
                updated_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Event", "An Event Registration has been updated.", "Updated");
            res.json({ status: true });
        } catch (error) {
            res.json({ status: false, message: 'Server Error.' });
        }
    }

    async deleteRegistration(req, res) {
        let { id } = req.params;
        await eventRegistrationModel.deleteOne({ _id: id });
        res.json({ status: true });
    }

    async addGallery(req, res) {
        try {
            let { user_id, user_name } = req.headers;
            let { data } = req.body;
            await eventGalleryModel.create({
                // id: crypto.randomBytes(16).toString("hex"),
                user_id: user_id,
                event_id: data.event_id,
                title: data.title,
                notes: data.notes,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Event", "New Event Gallery has been created.", "Created");
            res.json({ status: true });
        } catch (error) {
            res.json({ status: false, message: 'Server Error.' });
        }
    }

    async getGallerys(req, res) {
        let { user_id, user_name } = req.headers;
        let gallery = await eventGalleryModel.find({ user_id: user_id });
        let result = await Promise.all(gallery.map(async (e) => {
            let event;
            try {
                event = await eventsModel.find({ _id: e.event_id });
            }
            catch (e) { event = null; }
            
            return ({...e.toObject(), event: event});
        }));
        res.json({ status: true, result: result });
    }

    async getGallery(req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let result = await eventGalleryModel.findOne({ _id: id });
        res.json({ status: true, result: result });
    }

    async editGallery(req, res) {
        try {
            let { user_id, user_name } = req.headers;
            let { data, id } = req.body;
            await eventGalleryModel.updateOne({
                _id: id
            }, {
                event_id: data.event_id,
                title: data.title,
                notes: data.notes,
                updated_at: Date.now(),
                updated_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Event", "An Event Gallery has been updated.", "Updated");
            res.json({ status: true });
        } catch (error) {
            res.json({ status: false, message: 'Server Error.' });
        }
    }

    async deleteGallery(req, res) {
        let { id } = req.params;
        await eventGalleryModel.deleteOne({ _id: id });
        res.json({ status: true });
    }

    async addAlbum(req, res) {
        try {
            let { user_name, user_id } = req.headers;
            let { filename, description, gallery_id } = req.body;
            await galleryAlbumModel.create({
                // id: crypto.randomBytes(16).toString("hex"),
                gallery_id: gallery_id,
                filename: filename,
                description: description,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Gallery Album", "A Gallery Album has been created.", "Created");
            res.json({ status: true })
        } catch (error) {
            console.log(error);
            res.json({ status: false, message: 'Server Error' });
        }

    }

    async getAlbums(req, res) {
        let { gallery_id } = req.params;
        let result = await galleryAlbumModel.find({ gallery_id: gallery_id });
        res.json({ status: true, result: result });
    }

    async deleteAlbum(req, res) {
        let { user_name, user_id } = req.headers;
        let { id } = req.params;
        await galleryAlbumModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Gallery Album", "A Gallery Album has been deleted.", "Deleted");
        res.json({ status: true });
    }

}

module.exports = eventsController;