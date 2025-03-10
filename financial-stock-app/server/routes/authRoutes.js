// /routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser, getUserDetails, deleteUser } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', verifyToken, getUserDetails);
router.get('/delete',deleteUser);

module.exports = router;
