var express = require('express');
var router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');


/* GET products listing. */
router.get('/:id', authMiddleware, productController.getProduct);
router.get('/', authMiddleware, productController.getExchangeableProducts);
router.post('/', authMiddleware, productController.addProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.patch('/:id', authMiddleware, productController.setProductAsNonExchangeable);
router.delete('/:id', authMiddleware, productController.deleteProduct);
router.post('/uploadImage/:id', [authMiddleware,upload] , productController.uploadProductImage);

module.exports = router;
