const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { 
  PoliticianScore, 
  ScoreHistory, 
  ScoreComponent, 
  ScoringAction, 
  Politician 
} = require('../models');

/**
 * Scoring Service
 * Handles all scoring-related operations including:
 * - Calculating scores based on actions
 * - Applying time decay to older actions
 * - Updating politician scores
 * - Tracking score history
 */
class ScoringService {
  /**
   * Calculate the time value for an action based on its date
   * @param {Date} actionDate - Date of the action
   * @returns {number} Time value between 0.25 and 1.0
   */
  static calculateTimeValue(actionDate) {
    const now = new Date();
    const action = new Date(actionDate);
    const daysDifference = Math.floor((now - action) / (1000 * 60 * 60 * 24));
    
    if (daysDifference <= 30) {
      return 1.0; // 100% value for 0-30 days
    } else if (daysDifference <= 90) {
      return 0.75; // 75% value for 31-90 days
    } else if (daysDifference <= 180) {
      return 0.5; // 50% value for 91-180 days
    } else {
      return 0.25; // 25% value for 180+ days
    }
  }

  /**
   * Calculate recency bonus for recent activity
   * @param {Date} lastActivityDate - Date of last activity
   * @returns {number} Bonus points (0 or 5)
   */
  static calculateRecencyBonus(lastActivityDate) {
    if (!lastActivityDate) return 0;
    
    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const daysDifference = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    return daysDifference <= 14 ? 5 : 0; // 5-point bonus for activity within 14 days
  }

  /**
   * Calculate days of silence (days since last activity)
   * @param {Date} lastActivityDate - Date of last activity
   * @returns {number} Days of silence
   */
  static calculateDaysOfSilence(lastActivityDate) {
    if (!lastActivityDate) return 999; // Default to high number if no activity
    
    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    return Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  }

  /**
   * Process a new scoring action
   * @param {Object} action - The scoring action to process
   * @returns {Object} The processed action
   */
  static async processAction(action) {
    try {
      // Only process verified actions
      if (action.verification_status !== 'verified') {
        return action;
      }
      
      // Calculate time value based on action date
      const timeValue = this.calculateTimeValue(action.action_date);
      
      // Update the action's time value
      action.time_value = timeValue;
      await action.save();
      
      // Recalculate scores for the politician
      await this.recalculateScores(action.politician_id);
      
      return action;
    } catch (error) {
      console.error('Error processing action:', error);
      throw error;
    }
  }

  /**
   * Recalculate scores for a politician
   * @param {string} politicianId - UUID of the politician
   * @returns {Object} Updated politician score
   */
  static async recalculateScores(politicianId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Get all verified actions for the politician
      const actions = await ScoringAction.findAll({
        where: {
          politician_id: politicianId,
          verification_status: 'verified'
        },
        order: [['action_date', 'DESC']]
      });
      
      // If no actions, set default scores
      if (actions.length === 0) {
        const defaultScore = await this.createDefaultScore(politicianId, transaction);
        await transaction.commit();
        return defaultScore;
      }
      
      // Group actions by category
      const categorizedActions = {
        public_statements: [],
        legislative_action: [],
        public_engagement: [],
        social_media: [],
        consistency: []
      };
      
      // Process each action and group by category
      actions.forEach(action => {
        // Update time value
        action.time_value = this.calculateTimeValue(action.action_date);
        
        // Add to appropriate category
        if (categorizedActions[action.category]) {
          categorizedActions[action.category].push(action);
        }
      });
      
      // Calculate category scores
      const categoryScores = {};
      let lastActivityDate = null;
      
      // Calculate score for each category
      for (const category in categorizedActions) {
        const categoryActions = categorizedActions[category];
        
        if (categoryActions.length > 0) {
          // Update last activity date if this is more recent
          const mostRecentAction = categoryActions[0]; // Already sorted DESC
          if (!lastActivityDate || new Date(mostRecentAction.action_date) > new Date(lastActivityDate)) {
            lastActivityDate = mostRecentAction.action_date;
          }
          
          // Calculate weighted score for this category
          let totalPoints = 0;
          let totalWeight = 0;
          
          categoryActions.forEach(action => {
            const weightedPoints = action.points * action.time_value;
            totalPoints += weightedPoints;
            totalWeight += action.time_value;
          });
          
          // Calculate average score (0-100 scale)
          const rawScore = totalWeight > 0 ? (totalPoints / totalWeight) : 0;
          
          // Store category score
          categoryScores[category] = Math.min(100, Math.max(0, Math.round(rawScore)));
        } else {
          categoryScores[category] = 0;
        }
      }
      
      // Apply category weights to get total score
      const weights = {
        public_statements: 0.3,  // 30%
        legislative_action: 0.25, // 25%
        public_engagement: 0.2,   // 20%
        social_media: 0.15,       // 15%
        consistency: 0.1          // 10%
      };
      
      let weightedTotal = 0;
      
      for (const category in weights) {
        weightedTotal += (categoryScores[category] || 0) * weights[category];
      }
      
      // Add recency bonus if applicable
      const recencyBonus = this.calculateRecencyBonus(lastActivityDate);
      let totalScore = Math.round(weightedTotal) + recencyBonus;
      
      // Ensure score is within 0-100 range
      totalScore = Math.min(100, Math.max(0, totalScore));
      
      // Calculate days of silence
      const daysOfSilence = this.calculateDaysOfSilence(lastActivityDate);
      
      // Update or create politician score
      let politicianScore = await PoliticianScore.findOne({
        where: { politician_id: politicianId },
        transaction
      });
      
      if (politicianScore) {
        // Update existing score
        await politicianScore.update({
          total_score: totalScore,
          public_statements_score: categoryScores.public_statements || 0,
          legislative_action_score: categoryScores.legislative_action || 0,
          public_engagement_score: categoryScores.public_engagement || 0,
          social_media_score: categoryScores.social_media || 0,
          consistency_score: categoryScores.consistency || 0,
          days_of_silence: daysOfSilence,
          last_activity_date: lastActivityDate,
          last_calculated: new Date()
        }, { transaction });
      } else {
        // Create new score
        politicianScore = await PoliticianScore.create({
          politician_id: politicianId,
          total_score: totalScore,
          public_statements_score: categoryScores.public_statements || 0,
          legislative_action_score: categoryScores.legislative_action || 0,
          public_engagement_score: categoryScores.public_engagement || 0,
          social_media_score: categoryScores.social_media || 0,
          consistency_score: categoryScores.consistency || 0,
          days_of_silence: daysOfSilence,
          last_activity_date: lastActivityDate,
          last_calculated: new Date()
        }, { transaction });
      }
      
      // Record score history
      await ScoreHistory.create({
        politician_id: politicianId,
        total_score: totalScore,
        public_statements_score: categoryScores.public_statements || 0,
        legislative_action_score: categoryScores.legislative_action || 0,
        public_engagement_score: categoryScores.public_engagement || 0,
        social_media_score: categoryScores.social_media || 0,
        consistency_score: categoryScores.consistency || 0,
        days_of_silence: daysOfSilence,
        recorded_date: new Date()
      }, { transaction });
      
      // Update score components
      for (const category in categoryScores) {
        await ScoreComponent.upsert({
          politician_id: politicianId,
          category,
          score: categoryScores[category] || 0,
          weight: weights[category] || 0,
          last_updated: new Date()
        }, { transaction });
      }
      
      await transaction.commit();
      return politicianScore;
    } catch (error) {
      await transaction.rollback();
      console.error('Error recalculating scores:', error);
      throw error;
    }
  }

  /**
   * Create default score for a politician with no actions
   * @param {string} politicianId - UUID of the politician
   * @param {Object} transaction - Sequelize transaction
   * @returns {Object} Default politician score
   */
  static async createDefaultScore(politicianId, transaction) {
    // Create default score with zeros
    const politicianScore = await PoliticianScore.create({
      politician_id: politicianId,
      total_score: 0,
      public_statements_score: 0,
      legislative_action_score: 0,
      public_engagement_score: 0,
      social_media_score: 0,
      consistency_score: 0,
      days_of_silence: 999, // Default high number
      last_calculated: new Date()
    }, { transaction });
    
    // Record in score history
    await ScoreHistory.create({
      politician_id: politicianId,
      total_score: 0,
      public_statements_score: 0,
      legislative_action_score: 0,
      public_engagement_score: 0,
      social_media_score: 0,
      consistency_score: 0,
      days_of_silence: 999,
      recorded_date: new Date()
    }, { transaction });
    
    return politicianScore;
  }

  /**
   * Recalculate scores for all politicians
   * @returns {number} Number of politicians processed
   */
  static async recalculateAllScores() {
    try {
      // Get all politicians
      const politicians = await Politician.findAll();
      
      // Process each politician
      for (const politician of politicians) {
        await this.recalculateScores(politician.id);
      }
      
      return politicians.length;
    } catch (error) {
      console.error('Error recalculating all scores:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard of top scoring politicians
   * @param {number} limit - Number of politicians to return
   * @returns {Array} Top scoring politicians
   */
  static async getTopScorers(limit = 10) {
    try {
      return await PoliticianScore.findAll({
        limit,
        order: [['total_score', 'DESC']],
        include: [{
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position', 'photo_url']
        }]
      });
    } catch (error) {
      console.error('Error getting top scorers:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard of bottom scoring politicians
   * @param {number} limit - Number of politicians to return
   * @returns {Array} Bottom scoring politicians
   */
  static async getBottomScorers(limit = 10) {
    try {
      return await PoliticianScore.findAll({
        limit,
        order: [['total_score', 'ASC']],
        include: [{
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position', 'photo_url']
        }]
      });
    } catch (error) {
      console.error('Error getting bottom scorers:', error);
      throw error;
    }
  }

  /**
   * Get score history for a politician
   * @param {string} politicianId - UUID of the politician
   * @param {number} days - Number of days of history to return
   * @returns {Array} Score history entries
   */
  static async getScoreHistory(politicianId, days = 90) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      return await ScoreHistory.findAll({
        where: {
          politician_id: politicianId,
          recorded_date: {
            [Op.gte]: startDate
          }
        },
        order: [['recorded_date', 'ASC']]
      });
    } catch (error) {
      console.error('Error getting score history:', error);
      throw error;
    }
  }

  /**
   * Get detailed score breakdown for a politician
   * @param {string} politicianId - UUID of the politician
   * @returns {Object} Score breakdown with components and recent actions
   */
  static async getScoreBreakdown(politicianId) {
    try {
      // Get politician score
      const score = await PoliticianScore.findOne({
        where: { politician_id: politicianId },
        include: [{
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position', 'photo_url']
        }]
      });
      
      if (!score) {
        throw new Error('Politician score not found');
      }
      
      // Get score components
      const components = await ScoreComponent.findAll({
        where: { politician_id: politicianId },
        order: [['category', 'ASC']]
      });
      
      // Get recent actions
      const recentActions = await ScoringAction.findAll({
        where: {
          politician_id: politicianId,
          verification_status: 'verified'
        },
        order: [['action_date', 'DESC']],
        limit: 10
      });
      
      // Get score history
      const history = await this.getScoreHistory(politicianId, 90);
      
      return {
        score,
        components,
        recentActions,
        history,
        status: score.getStatus()
      };
    } catch (error) {
      console.error('Error getting score breakdown:', error);
      throw error;
    }
  }
}

module.exports = ScoringService;
