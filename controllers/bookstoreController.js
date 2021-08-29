var BookCategoryModel = require('../models/bookCategory');
var SchoolGradesModel = require('../models/schoolGrades');
var TransactionModel = require('../models/transaction');
var Users = require('../models/users');
var BookStoreModel = require('../models/bookStore');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class bookStoreController {
    async getCategories(req, res) {
        let { school_id } = req.headers
        let categories = await BookCategoryModel.find({ school_id: school_id })
        res.json({ status: true, result: categories })
    }

    async createCategory(req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let data = req.body
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] = {
            name: user_name,
            user_id: user_id
        };

        let item = await BookCategoryModel.create(data);
        saveActivity(user_id, user_name, "Book Category", "New Book Category has been created.", "Created");
        res.json({ status: true, result: item });
    }

    async updateCategory(req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['school_id'] = school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] = {
            name: user_name,
            user_id: user_id
        };

        await BookCategoryModel.updateOne({ _id: id }, data);
        saveActivity(user_id, user_name, "Book Category", "A Book Category has been updated.", "Updated");
        let categories = await BookCategoryModel.find({ school_id: school_id })
        res.json({ status: true, result: categories })
    }

    async deleteCategory(req, res) {
        let { id } = req.params
        let { user_id, user_name, school_id } = req.headers;
        await BookCategoryModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Book Category", "An Book Category About has been deleted.", "Deleted");
        let categories = await BookCategoryModel.find({ school_id: school_id })
        res.json({ status: true, result: categories })
    }

    async getBaseData(req, res) {
        let { school_id } = req.headers
        let categories = await BookCategoryModel.find({ school_id: school_id })
        let grades = await SchoolGradesModel.find({ school_id: school_id })

        res.json({
            status: true, result: {
                categories: categories,
                grades: grades
            }
        })
    }

    async getBooks(req, res) {
        try {
            let { user_id, school_id } = req.headers
            let books = await BookStoreModel.find({ school_id: school_id })
                .populate('grade_id', ['name', 'position'])
                .populate('category_id', ['category_name'])

            let users = (await Users.find({ student_id: user_id })).map((item) => item.user_id);
            users.push(user_id)
            let paidBooks = (await TransactionModel.find({ 'buyer.user_id': { $in: users } })).map((item) => item.item_id);

            res.json({
                status: true, result: {
                    books: books,
                    paidBooks: paidBooks
                }
            })
        } catch (e) {
            res.json({ status: false, error: "Getting error" })
        }
    }

    async getBook(req, res) {
        try {
            let { id } = req.params
            let book = await BookStoreModel.findOne({ _id: id })

            res.json({ status: true, result: book })
        } catch (e) {
            res.json({ status: false, error: "Getting error" })
        }
    }

    async createBook(req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let data = req.body
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] = {
            name: user_name,
            user_id: user_id
        };

        let item = await BookStoreModel.create(data);
        saveActivity(user_id, user_name, "Book", "New Book has been created.", "Created");
        res.json({ status: true, result: item });
    }

    async updateBook(req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['school_id'] = school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] = {
            name: user_name,
            user_id: user_id
        };

        await BookStoreModel.updateOne({ _id: id }, data);
        saveActivity(user_id, user_name, "Book", "A Book has been updated.", "Updated");
        let books = await BookStoreModel.find({school_id: school_id})
        res.json({ status: true, result: books })
    }

    async deleteBook(req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await BookStoreModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Book", "An Book About has been deleted.", "Deleted");
        let books = await BookStoreModel.find({school_id: school_id})
        res.json({ status: true, result: books })
    }
}

module.exports = bookStoreController;