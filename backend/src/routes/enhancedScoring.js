const express = require('express');
const router = express.Router();
const EnhancedScoringController = require('../controllers/enhancedScoringController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

/**
 * @route GET /api/v1/enhanced-scoring/assessment/:politicianId
 * @desc Get detailed assessment for a politician
 * @access Public
 */
router.get('/assessment/:politicianId', EnhancedScoringController.getDetailedAssessment);

/**
 * @route GET /api/v1/enhanced-scoring/resistance-level/:level
 * @desc Get politicians by resistance level
 * @access Public
 */
router.get('/resistance-level/:level', EnhancedScoringController.getPoliticiansByResistanceLevel);

/**
 * @route POST /api/v1/enhanced-scoring/actions
 * @desc Submit a new scoring action with enhanced metrics
 * @access Private
 */
router.post('/actions', authenticateJWT, EnhancedScoringController.submitScoringAction);

/**
 * @route PUT /api/v1/enhanced-scoring/actions/:actionId/verify
 * @desc Verify a scoring action
 * @access Private (Admin)
 */
router.put('/actions/:actionId/verify', [authenticateJWT, isAdmin], EnhancedScoringController.verifyScoringAction);

/**
 * @route PUT /api/v1/enhanced-scoring/actions/:actionId/reject
 * @desc Reject a scoring action
 * @access Private (Admin)
 */
router.put('/actions/:actionId/reject', [authenticateJWT, isAdmin], EnhancedScoringController.rejectScoringAction);

/**
 * @route POST /api/v1/enhanced-scoring/politicians/:politicianId/committees
 * @desc Add committee membership for a politician
 * @access Private (Admin)
 */
router.post('/politicians/:politicianId/committees', [authenticateJWT, isAdmin], EnhancedScoringController.addCommitteeMembership);

/**
 * @route GET /api/v1/enhanced-scoring/politicians/:politicianId/committees
 * @desc Get committee memberships for a politician
 * @access Public
 */
router.get('/politicians/:politicianId/committees', EnhancedScoringController.getCommitteeMemberships);

/**
 * @route POST /api/v1/enhanced-scoring/recalculate-all
 * @desc Recalculate scores for all politicians
 * @access Private (Admin)
 */
router.post('/recalculate-all', [authenticateJWT, isAdmin], EnhancedScoringController.recalculateAllScores);

/**
 * @route GET /api/v1/enhanced-scoring/politicians/:politicianId/contradictions
 * @desc Get contradictions for a politician
 * @access Public
 */
router.get('/politicians/:politicianId/contradictions', EnhancedScoringController.getContradictions);

module.exports = router;
