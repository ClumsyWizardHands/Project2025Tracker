const { Score, Politician, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all scores with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllScores = async (req, res) => {
  try {
    const { 
      politician_id, 
      category, 
      min_score, 
      max_score,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (politician_id) {
      whereConditions.politician_id = politician_id;
    }
    
    if (category) {
      whereConditions.category = category;
    }
    
    if (min_score !== undefined || max_score !== undefined) {
      whereConditions.score = {};
      
      if (min_score !== undefined) {
        whereConditions.score[Op.gte] = parseFloat(min_score);
      }
      
      if (max_score !== undefined) {
        whereConditions.score[Op.lte] = parseFloat(max_score);
      }
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Fetch scores with pagination
    const { count, rows: scores } = await Score.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'username']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_updated', 'DESC']]
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      success: true,
      data: {
        scores,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch scores'
    });
  }
};

/**
 * Get a score by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getScoreById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const score = await Score.findByPk(id, {
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'username']
        }
      ]
    });
    
    if (!score) {
      return res.status(404).json({
        success: false,
        error: 'Score not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: score
    });
  } catch (error) {
    console.error('Error fetching score:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch score'
    });
  }
};

/**
 * Create a new score
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createScore = async (req, res) => {
  try {
    const { politician_id, score, category, methodology } = req.body;
    
    // Validate required fields
    if (!politician_id || score === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: politician_id, score, category'
      });
    }
    
    // Validate score range (0-10)
    if (score < 0 || score > 10) {
      return res.status(400).json({
        success: false,
        error: 'Score must be between 0 and 10'
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
    
    // Create new score
    const newScore = await Score.create({
      politician_id,
      score,
      category,
      methodology,
      updated_by: req.user ? req.user.id : null,
      last_updated: new Date()
    });
    
    return res.status(201).json({
      success: true,
      data: newScore
    });
  } catch (error) {
    console.error('Error creating score:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create score'
    });
  }
};

/**
 * Update a score
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, category, methodology } = req.body;
    
    // Find the score
    const existingScore = await Score.findByPk(id);
    
    if (!existingScore) {
      return res.status(404).json({
        success: false,
        error: 'Score not found'
      });
    }
    
    // Validate score range if provided
    if (score !== undefined && (score < 0 || score > 10)) {
      return res.status(400).json({
        success: false,
        error: 'Score must be between 0 and 10'
      });
    }
    
    // Update score
    await existingScore.update({
      score: score !== undefined ? score : existingScore.score,
      category: category || existingScore.category,
      methodology: methodology !== undefined ? methodology : existingScore.methodology,
      updated_by: req.user ? req.user.id : existingScore.updated_by,
      last_updated: new Date()
    });
    
    return res.status(200).json({
      success: true,
      data: existingScore
    });
  } catch (error) {
    console.error('Error updating score:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update score'
    });
  }
};

/**
 * Delete a score
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteScore = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the score
    const score = await Score.findByPk(id);
    
    if (!score) {
      return res.status(404).json({
        success: false,
        error: 'Score not found'
      });
    }
    
    // Delete score
    await score.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Score deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting score:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete score'
    });
  }
};

/**
 * Get scores by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getScoresByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const scores = await Score.findAll({
      where: { category },
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position']
        }
      ],
      order: [['score', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Error fetching scores by category:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch scores by category'
    });
  }
};

/**
 * Get politician rankings based on scores
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPoliticianRankings = async (req, res) => {
  try {
    const { category, party, state, limit = 10 } = req.query;
    
    // Build filter conditions for politicians
    const politicianWhere = {};
    
    if (party) {
      politicianWhere.party = party;
    }
    
    if (state) {
      politicianWhere.state = state;
    }
    
    // Build filter conditions for scores
    const scoreWhere = {};
    
    if (category) {
      scoreWhere.category = category;
    }
    
    // Fetch politicians with their average scores
    const politicians = await Politician.findAll({
      where: politicianWhere,
      include: [
        {
          model: Score,
          as: 'scores',
          where: scoreWhere,
          required: false
        }
      ],
      limit: parseInt(limit)
    });
    
    // Calculate average scores and add days of silence
    const rankings = politicians.map(politician => {
      const scores = politician.scores || [];
      const totalScore = scores.reduce((sum, score) => sum + parseFloat(score.score), 0);
      const averageScore = scores.length > 0 ? totalScore / scores.length : null;
      
      // Calculate days of silence (mock data for now)
      const lastStatement = new Date();
      lastStatement.setDate(lastStatement.getDate() - Math.floor(Math.random() * 30));
      const daysOfSilence = Math.floor((new Date() - lastStatement) / (1000 * 60 * 60 * 24));
      
      return {
        id: politician.id,
        name: politician.name,
        party: politician.party,
        state: politician.state,
        position: politician.position,
        photo_url: politician.photo_url,
        averageScore: averageScore !== null ? parseFloat(averageScore.toFixed(1)) : null,
        scoreCount: scores.length,
        daysOfSilence,
        status: getStatusFromScore(averageScore)
      };
    });
    
    // Sort by average score (descending)
    rankings.sort((a, b) => {
      if (a.averageScore === null) return 1;
      if (b.averageScore === null) return -1;
      return b.averageScore - a.averageScore;
    });
    
    return res.status(200).json({
      success: true,
      data: rankings
    });
  } catch (error) {
    console.error('Error fetching politician rankings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch politician rankings'
    });
  }
};

/**
 * Get average scores across all politicians
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAverageScores = async (req, res) => {
  try {
    const { party } = req.query;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (party) {
      whereConditions['$politician.party$'] = party;
    }
    
    // Fetch all scores
    const scores = await Score.findAll({
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party']
        }
      ],
      where: whereConditions
    });
    
    // Group scores by category
    const categorizedScores = {};
    
    scores.forEach(score => {
      if (!categorizedScores[score.category]) {
        categorizedScores[score.category] = [];
      }
      
      categorizedScores[score.category].push(parseFloat(score.score));
    });
    
    // Calculate average for each category
    const averages = {};
    
    for (const category in categorizedScores) {
      const categoryScores = categorizedScores[category];
      const total = categoryScores.reduce((sum, score) => sum + score, 0);
      averages[category] = parseFloat((total / categoryScores.length).toFixed(1));
    }
    
    return res.status(200).json({
      success: true,
      data: averages
    });
  } catch (error) {
    console.error('Error fetching average scores:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch average scores'
    });
  }
};

/**
 * Calculate overall score for a politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.calculateOverallScore = async (req, res) => {
  try {
    const { politician_id } = req.params;
    
    // Check if politician exists
    const politician = await Politician.findByPk(politician_id, {
      include: [
        {
          model: Score,
          as: 'scores'
        }
      ]
    });
    
    if (!politician) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }
    
    // Calculate overall score
    const scores = politician.scores || [];
    
    if (scores.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          politician_id,
          overallScore: null,
          scoreBreakdown: {},
          status: 'INSUFFICIENT DATA'
        }
      });
    }
    
    // Group scores by category
    const categorizedScores = {};
    
    scores.forEach(score => {
      if (!categorizedScores[score.category]) {
        categorizedScores[score.category] = [];
      }
      
      categorizedScores[score.category].push(parseFloat(score.score));
    });
    
    // Calculate average for each category
    const categoryAverages = {};
    
    for (const category in categorizedScores) {
      const categoryScores = categorizedScores[category];
      const total = categoryScores.reduce((sum, score) => sum + score, 0);
      categoryAverages[category] = parseFloat((total / categoryScores.length).toFixed(1));
    }
    
    // Calculate overall score (average of category averages)
    const categoryValues = Object.values(categoryAverages);
    const overallScore = parseFloat((categoryValues.reduce((sum, score) => sum + score, 0) / categoryValues.length).toFixed(1));
    
    // Determine status based on overall score
    const status = getStatusFromScore(overallScore);
    
    return res.status(200).json({
      success: true,
      data: {
        politician_id,
        overallScore,
        scoreBreakdown: categoryAverages,
        status
      }
    });
  } catch (error) {
    console.error('Error calculating overall score:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate overall score'
    });
  }
};

/**
 * Get status from score
 * @param {number} score - Score value
 * @returns {string} Status label
 */
function getStatusFromScore(score) {
  if (score === null) {
    return 'INSUFFICIENT DATA';
  }
  
  if (score >= 7) {
    return 'WHISTLEBLOWER';
  } else if (score >= 4) {
    return 'UNDER SURVEILLANCE';
  } else {
    return 'PERSON OF INTEREST';
  }
}
