var express = require('express');
var router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

/* GET categories listing protected with middlewares (have to be authenticated). */
router.get('/', authMiddleware, categoryController.getCategories);
router.post('/', authMiddleware, categoryController.addCategory);

module.exports = router;
