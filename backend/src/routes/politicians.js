const express = require('express');
const router = express.Router();
const politiciansController = require('../controllers/politicians');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @route GET /api/v1/politicians
 * @desc Get all politicians with optional filtering
 * @access Public
 */
router.get('/', politiciansController.getAllPoliticians);

/**
 * @route GET /api/v1/politicians/:id
 * @desc Get a politician by ID
 * @access Public
 */
router.get('/:id', politiciansController.getPoliticianById);

/**
 * @route POST /api/v1/politicians
 * @desc Create a new politician
 * @access Private (Admin)
 */
router.post('/', authenticateJWT, politiciansController.createPolitician);

/**
 * @route PUT /api/v1/politicians/:id
 * @desc Update a politician
 * @access Private (Admin)
 */
router.put('/:id', authenticateJWT, politiciansController.updatePolitician);

/**
 * @route DELETE /api/v1/politicians/:id
 * @desc Delete a politician
 * @access Private (Admin)
 */
router.delete('/:id', authenticateJWT, politiciansController.deletePolitician);

/**
 * @route GET /api/v1/politicians/:id/statements
 * @desc Get all statements by a politician
 * @access Public
 */
router.get('/:id/statements', politiciansController.getPoliticianStatements);

/**
 * @route GET /api/v1/politicians/:id/scores
 * @desc Get all scores for a politician
 * @access Public
 */
router.get('/:id/scores', politiciansController.getPoliticianScores);

module.exports = router;
