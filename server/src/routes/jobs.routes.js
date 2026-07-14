const express = require('express');
const { body } = require('express-validator');
const jobsController = require('../controllers/jobs.controller');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');

const router = express.Router();

// Job creation validation constraints
const jobValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  body('budget')
    .isFloat({ gt: 0 }).withMessage('Budget must be a number greater than 0'),
  body('skills')
    .isArray({ min: 1 }).withMessage('Skills must be a non-empty array'),
  body('deadline')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date (YYYY-MM-DD)')
];

// Proposal submission validation constraints
const proposalValidationRules = [
  body('cover_letter')
    .trim()
    .isLength({ min: 50 }).withMessage('Cover letter must be at least 50 characters long'),
  body('proposed_budget')
    .isFloat({ gt: 0 }).withMessage('Proposed budget must be greater than 0'),
  body('timeline_days')
    .isInt({ min: 1, max: 365 }).withMessage('Timeline must be an integer between 1 and 365 days'),
  body('portfolio_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('Portfolio URL must be a valid URL')
];

router.get('/', jobsController.getJobs);
router.post('/', requireRole(['employer']), jobValidationRules, validate, jobsController.createJob);
router.get('/:id', jobsController.getJobById);
router.post('/:id/proposals', requireRole(['freelancer']), proposalValidationRules, validate, jobsController.submitProposal);
router.put('/:id/proposals/:proposalId/accept', requireRole(['employer']), jobsController.acceptProposal);

module.exports = router;
