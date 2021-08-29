var mongoose = require('mongoose');

var schema = mongoose.Schema({
    description:String,
    floor_no:String,
    location_id:String,
    room_capacity:Number,
    room_no: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('RoomModel', schema);
