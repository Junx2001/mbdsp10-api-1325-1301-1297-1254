var express = require('express');
var router = express.Router();
const productController = require('../controllers/productController');

/* GET products listing. */
router.get('/', productController.getProducts);
router.post('/', productController.addProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
