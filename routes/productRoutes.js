var express = require('express');
var router = express.Router();
const productController = require('../controllers/productController');

/* GET products listing. */
router.get('/:id', productController.getProduct);
router.get('/', productController.getProducts);
router.post('/', productController.addProduct);
router.put('/:id', productController.updateProduct);
router.patch('/:id', productController.setProductAsNonExchangeable);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
