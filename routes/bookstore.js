var express = require('express');
var router = express.Router();
var bookStoreController = require('../controllers/bookstoreController');
var bookStore = new bookStoreController();

router.get('/category', bookStore.getCategories);
router.post('/category', bookStore.createCategory);
router.put('/category/:id', bookStore.updateCategory);
router.delete('/category/:id', bookStore.deleteCategory);
router.get('/base', bookStore.getBaseData)
router.get('/book/:id', bookStore.getBook)
router.post('/book', bookStore.createBook)
router.put('/book/:id', bookStore.updateBook)
router.delete('/book/:id', bookStore.deleteBook)
router.get('/books', bookStore.getBooks)

module.exports = router;