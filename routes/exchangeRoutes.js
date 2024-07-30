var express = require('express');
var router = express.Router();
const exchangeController = require('../controllers/exchangeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:id/accept', authMiddleware, exchangeController.acceptExchange);
router.post('/', authMiddleware, exchangeController.createExchange);
router.get('/:id', authMiddleware, exchangeController.getExchangeDetail);


module.exports = router;
