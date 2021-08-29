var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    gallery_id: String,
    filename: String,
    description: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('galleryAlbumModel', schema);
