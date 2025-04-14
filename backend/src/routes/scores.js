const express = require('express');
const router = express.Router();
const scoresController = require('../controllers/scores');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @route GET /api/v1/scores
 * @desc Get all scores with optional filtering
 * @access Public
 */
router.get('/', scoresController.getAllScores);

/**
 * @route GET /api/v1/scores/:id
 * @desc Get a score by ID
 * @access Public
 */
router.get('/:id', scoresController.getScoreById);

/**
 * @route POST /api/v1/scores
 * @desc Create a new score
 * @access Private (Admin)
 */
router.post('/', authenticateJWT, scoresController.createScore);

/**
 * @route PUT /api/v1/scores/:id
 * @desc Update a score
 * @access Private (Admin)
 */
router.put('/:id', authenticateJWT, scoresController.updateScore);

/**
 * @route DELETE /api/v1/scores/:id
 * @desc Delete a score
 * @access Private (Admin)
 */
router.delete('/:id', authenticateJWT, scoresController.deleteScore);

/**
 * @route GET /api/v1/scores/category/:category
 * @desc Get scores by category
 * @access Public
 */
router.get('/category/:category', scoresController.getScoresByCategory);

/**
 * @route GET /api/v1/scores/rankings
 * @desc Get politician rankings based on scores
 * @access Public
 */
router.get('/rankings', scoresController.getPoliticianRankings);

/**
 * @route GET /api/v1/scores/average
 * @desc Get average scores across all politicians
 * @access Public
 */
router.get('/average', scoresController.getAverageScores);

/**
 * @route GET /api/v1/scores/politician/:politician_id/overall
 * @desc Calculate overall score for a politician
 * @access Public
 */
router.get('/politician/:politician_id/overall', scoresController.calculateOverallScore);

module.exports = router;
