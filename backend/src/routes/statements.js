const express = require('express');
const router = express.Router();
const statementsController = require('../controllers/statements');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @route GET /api/v1/statements
 * @desc Get all statements with optional filtering
 * @access Public
 */
router.get('/', statementsController.getAllStatements);

/**
 * @route GET /api/v1/statements/:id
 * @desc Get a statement by ID
 * @access Public
 */
router.get('/:id', statementsController.getStatementById);

/**
 * @route POST /api/v1/statements
 * @desc Create a new statement
 * @access Private (Admin)
 */
router.post('/', authenticateJWT, statementsController.createStatement);

/**
 * @route PUT /api/v1/statements/:id
 * @desc Update a statement
 * @access Private (Admin)
 */
router.put('/:id', authenticateJWT, statementsController.updateStatement);

/**
 * @route DELETE /api/v1/statements/:id
 * @desc Delete a statement
 * @access Private (Admin)
 */
router.delete('/:id', authenticateJWT, statementsController.deleteStatement);

/**
 * @route PUT /api/v1/statements/:id/verify
 * @desc Verify a statement
 * @access Private (Admin)
 */
router.put('/:id/verify', authenticateJWT, statementsController.verifyStatement);

/**
 * @route GET /api/v1/statements/tag/:tag
 * @desc Get statements by tag
 * @access Public
 */
router.get('/tag/:tag', statementsController.getStatementsByTag);

/**
 * @route GET /api/v1/statements/tags
 * @desc Get all tags
 * @access Public
 */
router.get('/tags', statementsController.getAllTags);

/**
 * @route GET /api/v1/statements/recent
 * @desc Get recent statements
 * @access Public
 */
router.get('/recent', statementsController.getRecentStatements);

/**
 * @route GET /api/v1/statements/politician/:politician_id
 * @desc Get statements by politician
 * @access Public
 */
router.get('/politician/:politician_id', statementsController.getStatementsByPolitician);

/**
 * @route GET /api/v1/statements/statistics
 * @desc Get statement statistics
 * @access Public
 */
router.get('/statistics', statementsController.getStatementStatistics);

module.exports = router;
