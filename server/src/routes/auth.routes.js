const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');

const router = express.Router();

// Registration route validation rules
const registerValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Must be a valid email address'),
  body('phone')
    .trim()
    .matches(/^(07\d{8}|254\d{9})$/).withMessage('Phone number must match format 07XXXXXXXX or 254XXXXXXXXX'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('role')
    .trim()
    .isIn(['freelancer', 'employer']).withMessage('Role must be either freelancer or employer')
];

router.post('/register', registerValidationRules, validate, authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', requireRole(), authController.me);

module.exports = router;
