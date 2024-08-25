var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/rate', authMiddleware, userController.rateUser);
router.get('/profile/:id', authMiddleware, userController.getProfileRatings);


module.exports = router;
