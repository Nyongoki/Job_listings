const express = require('express');
const { body } = require('express-validator');
const contractsController = require('../controllers/contracts.controller');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');

const router = express.Router();

// Dispute validation constraints
const disputeValidationRules = [
  body('reason')
    .trim()
    .isLength({ min: 20 }).withMessage('Dispute reason must be at least 20 characters long')
];

router.post('/:id/fund', requireRole(['employer']), contractsController.fundContract);
router.post('/:id/deliver', requireRole(['freelancer']), contractsController.deliverContract);
router.post('/:id/approve', requireRole(['employer']), contractsController.approveContract);
router.post('/:id/dispute', requireRole(), disputeValidationRules, validate, contractsController.disputeContract);

module.exports = router;
