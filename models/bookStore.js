var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    title: String,
    grade_id: {type: mongoose.Schema.Types.ObjectId, ref: "SchoolGradesModel"},
    category_id: {type: mongoose.Schema.Types.ObjectId, ref: "BookCategoryModel"},
    publisher_name: String,
    author_name: String,
    isbn_number: String,
    description: String,
    files: [],
    cover_image: String,
    paid: Boolean,
    price: Number,
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('BookStoreModel', schema);
