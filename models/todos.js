var mongoose = require('mongoose');

var schema = mongoose.Schema({
    user_id: String,
    tasks: [], //taskId, title, description, todoDate, status
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('TodosModel', schema);
