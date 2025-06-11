const express = require('express');
const AuthController = require('../controller/auth.controller');
const router = express.Router();

// GET Routes
router.get('/', AuthController.getLogin);
router.get('/login', AuthController.getLogin);
router.get('/signup', AuthController.getSignup);

// POST Routes
router.post('/login', AuthController.postLogin);
router.post('/signup', AuthController.postSignup);


module.exports = router;