const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('/controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('avatar'), updateProfile);

module.exports = router;