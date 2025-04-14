const express = require('express');
const router = express.Router();
const scoringController = require('../controllers/scoringController');
const { authenticateJWT, isAdmin, isResearcher } = require('../middleware/auth');

/**
 * @route GET /api/v1/scoring/politicians/:id
 * @desc Get score for a specific politician
 * @access Public
 */
router.get('/politicians/:id', scoringController.getPoliticianScore);

/**
 * @route GET /api/v1/scoring/politicians/:id/breakdown
 * @desc Get detailed score breakdown for a politician
 * @access Public
 */
router.get('/politicians/:id/breakdown', scoringController.getScoreBreakdown);

/**
 * @route GET /api/v1/scoring/politicians/:id/history
 * @desc Get score history for a politician
 * @access Public
 */
router.get('/politicians/:id/history', scoringController.getScoreHistory);

/**
 * @route GET /api/v1/scoring/politicians/:id/actions
 * @desc Get scoring actions for a politician
 * @access Public
 */
router.get('/politicians/:id/actions', scoringController.getPoliticianActions);

/**
 * @route POST /api/v1/scoring/actions
 * @desc Add a new scoring action
 * @access Private (Researcher or Admin)
 */
router.post('/actions', authenticateJWT, isResearcher, scoringController.addScoringAction);

/**
 * @route PUT /api/v1/scoring/actions/:id/verify
 * @desc Verify a scoring action
 * @access Private (Admin)
 */
router.put('/actions/:id/verify', authenticateJWT, isAdmin, scoringController.verifyAction);

/**
 * @route PUT /api/v1/scoring/actions/:id/reject
 * @desc Reject a scoring action
 * @access Private (Admin)
 */
router.put('/actions/:id/reject', authenticateJWT, isAdmin, scoringController.rejectAction);

/**
 * @route GET /api/v1/scoring/actions/pending
 * @desc Get pending actions for verification
 * @access Private (Admin)
 */
router.get('/actions/pending', authenticateJWT, isAdmin, scoringController.getPendingActions);

/**
 * @route GET /api/v1/scoring/actions/recent
 * @desc Get recent verified actions
 * @access Public
 */
router.get('/actions/recent', scoringController.getRecentVerifiedActions);

/**
 * @route GET /api/v1/scoring/leaderboard/top
 * @desc Get top scoring politicians
 * @access Public
 */
router.get('/leaderboard/top', scoringController.getTopScorers);

/**
 * @route GET /api/v1/scoring/leaderboard/bottom
 * @desc Get bottom scoring politicians
 * @access Public
 */
router.get('/leaderboard/bottom', scoringController.getBottomScorers);

/**
 * @route PUT /api/v1/scoring/recalculate/:id
 * @desc Recalculate scores for a politician
 * @access Private (Admin)
 */
router.put('/recalculate/:id', authenticateJWT, isAdmin, scoringController.recalculateScores);

/**
 * @route PUT /api/v1/scoring/recalculate-all
 * @desc Recalculate scores for all politicians
 * @access Private (Admin)
 */
router.put('/recalculate-all', authenticateJWT, isAdmin, scoringController.recalculateAllScores);

/**
 * @route GET /api/v1/scoring/stats
 * @desc Get scoring statistics
 * @access Public
 */
router.get('/stats', scoringController.getScoringStats);

module.exports = router;
