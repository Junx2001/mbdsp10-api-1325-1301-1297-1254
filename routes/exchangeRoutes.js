var express = require('express');
var router = express.Router();
const exchangeController = require('../controllers/exchangeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:id/accept', authMiddleware, exchangeController.acceptExchange);
router.post('/', authMiddleware, exchangeController.createExchange);


module.exports = router;
