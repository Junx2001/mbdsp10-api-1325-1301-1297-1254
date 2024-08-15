var express = require('express');
var router = express.Router();
const exchangeController = require('../controllers/exchangeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:id/accept', authMiddleware, exchangeController.acceptExchange);
router.post('/', authMiddleware, exchangeController.createExchange);
router.get('/:id', authMiddleware, exchangeController.getExchangeDetail);
router.post('/:id/cancel', authMiddleware, exchangeController.cancelExchange);
router.put('/:id/receive', authMiddleware, exchangeController.receiveExchange);
router.get('/', authMiddleware, exchangeController.getAllMyExchanges);



module.exports = router;
