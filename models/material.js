var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    title: String,
    grade_id: {type: mongoose.Schema.Types.ObjectId, ref: "SchoolGradesModel"},
    publisher_name: String,
    author_name: String,
    due_date: String,
    isbn_number: String,
    description: String,
    files: [],
    cover_image: String,
    price: Number,
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('MaterialModel', schema);
