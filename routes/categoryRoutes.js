var express = require('express');
var router = express.Router();
const categoryController = require('../controllers/categoryController');

/* GET categories listing. */
router.get('/', categoryController.getCategories);
router.post('/', categoryController.addCategory);

module.exports = router;
