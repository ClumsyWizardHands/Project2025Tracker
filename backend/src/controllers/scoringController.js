const { 
  PoliticianScore, 
  ScoreHistory, 
  ScoreComponent, 
  ScoringAction, 
  Politician,
  User 
} = require('../models');
const ScoringService = require('../services/scoringService');
const { Op } = require('sequelize');

/**
 * Get politician score
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPoliticianScore = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if politician exists
    const politician = await Politician.findByPk(id);
    if (!politician) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }
    
    // Get score
    let score = await PoliticianScore.findOne({
      where: { politician_id: id },
      include: [{
        model: Politician,
        as: 'politician',
        attributes: ['id', 'name', 'party', 'state', 'position', 'photo_url']
      }]
    });
    
    // If no score exists, create default score
    if (!score) {
      score = await ScoringService.createDefaultScore(id);
    }
    
    // Get status
    const status = score.getStatus();
    
    return res.status(200).json({
      success: true,
      data: {
        ...score.toJSON(),
        status
      }
    });
  } catch (error) {
    console.error('Error getting politician score:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get politician score'
    });
  }
};

/**
 * Get detailed score breakdown
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getScoreBreakdown = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if politician exists
    const politician = await Politician.findByPk(id);
    if (!politician) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }
    
    // Get detailed breakdown
    const breakdown = await ScoringService.getScoreBreakdown(id);
    
    return res.status(200).json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Error getting score breakdown:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get score breakdown'
    });
  }
};

/**
 * Get score history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getScoreHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 90 } = req.query;
    
    // Check if politician exists
    const politician = await Politician.findByPk(id);
    if (!politician) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }
    
    // Get history
    const history = await ScoringService.getScoreHistory(id, parseInt(days));
    
    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting score history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get score history'
    });
  }
};

/**
 * Get top scoring politicians
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTopScorers = async (req, res) => {
  try {
    const { limit = 10, party, state } = req.query;
    
    // Build query conditions
    const whereConditions = {};
    const politicianWhere = {};
    
    if (party) {
      politicianWhere.party = party;
    }
    
    if (state) {
      politicianWhere.state = state;
    }
    
    // Get top scorers
    const scores = await PoliticianScore.findAll({
      limit: parseInt(limit),
      order: [['total_score', 'DESC']],
      include: [{
        model: Politician,
        as: 'politician',
        attributes: ['id', 'name', 'party', 'state', 'position', 'photo_url'],
        where: Object.keys(politicianWhere).length > 0 ? politicianWhere : undefined
      }]
    });
    
    // Add status to each score
    const scoresWithStatus = scores.map(score => ({
      ...score.toJSON(),
      status: score.getStatus()
    }));
    
    return res.status(200).json({
      success: true,
      data: scoresWithStatus
    });
  } catch (error) {
    console.error('Error getting top scorers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get top scorers'
    });
  }
};

/**
 * Get bottom scoring politicians
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBottomScorers = async (req, res) => {
  try {
    const { limit = 10, party, state } = req.query;
    
    // Build query conditions
    const whereConditions = {};
    const politicianWhere = {};
    
    if (party) {
      politicianWhere.party = party;
    }
    
    if (state) {
      politicianWhere.state = state;
    }
    
    // Get bottom scorers
    const scores = await PoliticianScore.findAll({
      limit: parseInt(limit),
      order: [['total_score', 'ASC']],
      include: [{
        model: Politician,
        as: 'politician',
        attributes: ['id', 'name', 'party', 'state', 'position', 'photo_url'],
        where: Object.keys(politicianWhere).length > 0 ? politicianWhere : undefined
      }]
    });
    
    // Add status to each score
    const scoresWithStatus = scores.map(score => ({
      ...score.toJSON(),
      status: score.getStatus()
    }));
    
    return res.status(200).json({
      success: true,
      data: scoresWithStatus
    });
  } catch (error) {
    console.error('Error getting bottom scorers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get bottom scorers'
    });
  }
};

/**
 * Get scoring actions for a politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPoliticianActions = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      category, 
      verification_status = 'verified',
      limit = 50,
      offset = 0
    } = req.query;
    
    // Check if politician exists
    const politician = await Politician.findByPk(id);
    if (!politician) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }
    
    // Get actions
    const actions = await ScoringAction.findByPoliticianId(id, {
      category,
      verification_status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return res.status(200).json({
      success: true,
      data: actions
    });
  } catch (error) {
    console.error('Error getting politician actions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get politician actions'
    });
  }
};

/**
 * Add a new scoring action
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addScoringAction = async (req, res) => {
  try {
    const {
      politician_id,
      action_type,
      action_date,
      description,
      source_url,
      points,
      category,
      sub_category
    } = req.body;
    
    // Validate required fields
    if (!politician_id || !action_type || !action_date || !description || !points || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Check if politician exists
    const politician = await Politician.findByPk(politician_id);
    if (!politician) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }
    
    // Create action
    const action = await ScoringAction.create({
      politician_id,
      action_type,
      action_date,
      description,
      source_url,
      points,
      category,
      sub_category,
      verification_status: 'pending',
      created_by: req.user ? req.user.id : null,
      time_value: ScoringService.calculateTimeValue(action_date)
    });
    
    return res.status(201).json({
      success: true,
      data: action,
      message: 'Action submitted for verification'
    });
  } catch (error) {
    console.error('Error adding scoring action:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add scoring action'
    });
  }
};

/**
 * Verify a scoring action
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyAction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if action exists
    const action = await ScoringAction.findByPk(id);
    if (!action) {
      return res.status(404).json({
        success: false,
        error: 'Action not found'
      });
    }
    
    // Check if already verified
    if (action.verification_status === 'verified') {
      return res.status(400).json({
        success: false,
        error: 'Action already verified'
      });
    }
    
    // Verify action
    await action.verify(req.user.id);
    
    // Process action to update scores
    await ScoringService.processAction(action);
    
    return res.status(200).json({
      success: true,
      data: action,
      message: 'Action verified and scores updated'
    });
  } catch (error) {
    console.error('Error verifying action:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify action'
    });
  }
};

/**
 * Reject a scoring action
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.rejectAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Check if action exists
    const action = await ScoringAction.findByPk(id);
    if (!action) {
      return res.status(404).json({
        success: false,
        error: 'Action not found'
      });
    }
    
    // Check if already verified or rejected
    if (action.verification_status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Action already ${action.verification_status}`
      });
    }
    
    // Reject action
    await action.reject(req.user.id);
    
    return res.status(200).json({
      success: true,
      data: action,
      message: 'Action rejected'
    });
  } catch (error) {
    console.error('Error rejecting action:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reject action'
    });
  }
};

/**
 * Get pending actions for verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPendingActions = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get pending actions
    const actions = await ScoringAction.getPendingActions(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: actions
    });
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get pending actions'
    });
  }
};

/**
 * Get recent verified actions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRecentVerifiedActions = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get recent verified actions
    const actions = await ScoringAction.getRecentVerifiedActions(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: actions
    });
  } catch (error) {
    console.error('Error getting recent verified actions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get recent verified actions'
    });
  }
};

/**
 * Recalculate scores for a politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.recalculateScores = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if politician exists
    const politician = await Politician.findByPk(id);
    if (!politician) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }
    
    // Recalculate scores
    const score = await ScoringService.recalculateScores(id);
    
    return res.status(200).json({
      success: true,
      data: score,
      message: 'Scores recalculated successfully'
    });
  } catch (error) {
    console.error('Error recalculating scores:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to recalculate scores'
    });
  }
};

/**
 * Recalculate scores for all politicians
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.recalculateAllScores = async (req, res) => {
  try {
    // Recalculate all scores
    const count = await ScoringService.recalculateAllScores();
    
    return res.status(200).json({
      success: true,
      message: `Scores recalculated for ${count} politicians`
    });
  } catch (error) {
    console.error('Error recalculating all scores:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to recalculate all scores'
    });
  }
};

/**
 * Get scoring statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getScoringStats = async (req, res) => {
  try {
    // Get counts
    const totalPoliticians = await Politician.count();
    const scoredPoliticians = await PoliticianScore.count();
    const pendingActions = await ScoringAction.count({
      where: { verification_status: 'pending' }
    });
    const verifiedActions = await ScoringAction.count({
      where: { verification_status: 'verified' }
    });
    
    // Get average scores by party
    const democratScores = await PoliticianScore.findAll({
      include: [{
        model: Politician,
        as: 'politician',
        where: { party: 'Democrat' }
      }]
    });
    
    const republicanScores = await PoliticianScore.findAll({
      include: [{
        model: Politician,
        as: 'politician',
        where: { party: 'Republican' }
      }]
    });
    
    const independentScores = await PoliticianScore.findAll({
      include: [{
        model: Politician,
        as: 'politician',
        where: { party: 'Independent' }
      }]
    });
    
    // Calculate averages
    const democratAvg = democratScores.length > 0
      ? democratScores.reduce((sum, score) => sum + score.total_score, 0) / democratScores.length
      : 0;
      
    const republicanAvg = republicanScores.length > 0
      ? republicanScores.reduce((sum, score) => sum + score.total_score, 0) / republicanScores.length
      : 0;
      
    const independentAvg = independentScores.length > 0
      ? independentScores.reduce((sum, score) => sum + score.total_score, 0) / independentScores.length
      : 0;
    
    // Get distribution of scores
    const scoreRanges = {
      '0-20': await PoliticianScore.count({ where: { total_score: { [Op.between]: [0, 20] } } }),
      '21-40': await PoliticianScore.count({ where: { total_score: { [Op.between]: [21, 40] } } }),
      '41-60': await PoliticianScore.count({ where: { total_score: { [Op.between]: [41, 60] } } }),
      '61-80': await PoliticianScore.count({ where: { total_score: { [Op.between]: [61, 80] } } }),
      '81-100': await PoliticianScore.count({ where: { total_score: { [Op.between]: [81, 100] } } })
    };
    
    return res.status(200).json({
      success: true,
      data: {
        totalPoliticians,
        scoredPoliticians,
        pendingActions,
        verifiedActions,
        partyAverages: {
          Democrat: Math.round(democratAvg * 10) / 10,
          Republican: Math.round(republicanAvg * 10) / 10,
          Independent: Math.round(independentAvg * 10) / 10
        },
        scoreDistribution: scoreRanges
      }
    });
  } catch (error) {
    console.error('Error getting scoring stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get scoring stats'
    });
  }
};
