const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { 
  PoliticianScore, 
  ScoreHistory, 
  ScoreComponent, 
  ScoringAction, 
  Politician,
  PoliticianCommittee,
  EvidenceSource
} = require('../models');

/**
 * Enhanced Scoring Service
 * Implements the updated scoring methodology that prioritizes actions over words
 * and applies more nuanced evaluation criteria.
 */
class EnhancedScoringService {
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
   * Calculate performance modifier based on action type and follow-up
   * @param {Object} action - The scoring action
   * @returns {number} Performance modifier between 0.3 and 1.0
   */
  static calculatePerformanceModifier(action) {
    // Apply 0.5x modifier for social posts without follow-up
    if (action.category === 'social_media' && !action.has_action_follow_up) {
      return 0.5;
    }
    
    // Apply 0.3x for ceremonial engagements
    if (action.category === 'public_engagement' && action.strategic_value === 'Low') {
      return 0.3;
    }
    
    return 1.0; // No discount for other actions
  }

  /**
   * Calculate strategic integrity score based on alignment between words and actions
   * @param {Array} actions - Array of scoring actions
   * @returns {number} Strategic integrity score (0-100)
   */
  static calculateStrategicIntegrity(actions) {
    if (!actions || actions.length === 0) return 0;
    
    // Group actions by category
    const statements = actions.filter(a => a.category === 'public_statements');
    const legislative = actions.filter(a => a.category === 'legislative_action');
    
    if (statements.length === 0 || legislative.length === 0) return 50; // Neutral if not enough data
    
    // Count contradictions
    const contradictions = actions.filter(a => a.contradiction_flag).length;
    
    // Calculate alignment score
    let alignmentScore = 100;
    
    // Deduct points for each contradiction (more weight for recent contradictions)
    actions.filter(a => a.contradiction_flag).forEach(action => {
      const deduction = 10 * action.time_value; // More recent contradictions have higher impact
      alignmentScore -= deduction;
    });
    
    // Bonus for consistent high-impact actions
    const highImpactActions = actions.filter(a => a.impact_level === 'High').length;
    if (highImpactActions >= 3) {
      alignmentScore += 10;
    }
    
    // Ensure score is within 0-100 range
    return Math.min(100, Math.max(0, Math.round(alignmentScore)));
  }

  /**
   * Calculate infrastructure understanding score based on use of position power
   * @param {Array} actions - Array of scoring actions
   * @param {Object} politician - Politician object with committees
   * @returns {number} Infrastructure understanding score (0-100)
   */
  static async calculateInfrastructureUnderstanding(actions, politicianId) {
    if (!actions || actions.length === 0) return 0;
    
    // Get politician's committees
    const committees = await PoliticianCommittee.findAll({
      where: { politician_id: politicianId }
    });
    
    // Base score
    let score = 50;
    
    // Analyze legislative actions for procedural defense
    const proceduralDefense = actions.filter(a => 
      a.category === 'legislative_action' && 
      a.sub_category === 'procedural_defense'
    ).length;
    
    // Bonus for procedural defense actions
    score += proceduralDefense * 5;
    
    // Check if politician is using committee power
    if (committees.length > 0) {
      const committeeActions = actions.filter(a => 
        a.category === 'legislative_action' && 
        a.sub_category === 'committee_power'
      ).length;
      
      // Bonus for using committee power
      score += committeeActions * 7;
      
      // Penalty for not using committee power despite having it
      if (committeeActions === 0) {
        score -= 15;
      }
    }
    
    // Bonus for high-risk actions
    const highRiskActions = actions.filter(a => a.risk_level === 'High').length;
    score += highRiskActions * 3;
    
    // Ensure score is within 0-100 range
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Calculate performance vs impact score
   * @param {Array} actions - Array of scoring actions
   * @returns {number} Performance vs impact score (0-100)
   */
  static calculatePerformanceVsImpact(actions) {
    if (!actions || actions.length === 0) return 0;
    
    // Count high-impact actions
    const highImpactCount = actions.filter(a => a.impact_level === 'High').length;
    
    // Count low-impact, high-visibility actions
    const performativeCount = actions.filter(a => 
      a.impact_level === 'Low' && 
      a.performance_modifier < 1.0
    ).length;
    
    // Calculate ratio (higher is better)
    const ratio = performativeCount > 0 ? highImpactCount / performativeCount : highImpactCount;
    
    // Convert to score (0-100)
    let score = 50; // Start at neutral
    
    if (ratio >= 2) {
      // Excellent ratio of impact to performance
      score = 80 + Math.min(20, ratio * 2);
    } else if (ratio >= 1) {
      // Good ratio
      score = 60 + Math.min(20, ratio * 10);
    } else if (ratio > 0) {
      // Poor ratio
      score = 40 * ratio;
    } else if (highImpactCount === 0 && performativeCount > 0) {
      // Only performative actions
      score = 20;
    } else if (highImpactCount === 0 && performativeCount === 0) {
      // No relevant actions
      score = 50;
    }
    
    // Ensure score is within 0-100 range
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Determine resistance level based on scores
   * @param {Object} scores - Politician score object
   * @returns {string} Resistance level
   */
  static determineResistanceLevel(scores) {
    const { 
      total_score, 
      strategic_integrity_score, 
      infrastructure_understanding_score,
      performance_vs_impact_score
    } = scores;
    
    // Defender: High total score and strategic integrity
    if (total_score >= 80 && strategic_integrity_score >= 70) {
      return 'Defender';
    }
    
    // Active Resistor: Good scores across the board
    if (total_score >= 60 && strategic_integrity_score >= 50 && infrastructure_understanding_score >= 50) {
      return 'Active Resistor';
    }
    
    // Inconsistent Advocate: Mixed scores
    if (total_score >= 40) {
      return 'Inconsistent Advocate';
    }
    
    // Complicit Enabler: Low scores
    return 'Complicit Enabler';
  }

  /**
   * Process a new scoring action with enhanced metrics
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
      
      // Calculate performance modifier
      const performanceModifier = this.calculatePerformanceModifier(action);
      
      // Update the action's values
      action.time_value = timeValue;
      action.performance_modifier = performanceModifier;
      await action.save();
      
      // Check for contradictions
      await this.checkForContradictions(action);
      
      // Recalculate scores for the politician
      await this.recalculateScores(action.politician_id);
      
      return action;
    } catch (error) {
      console.error('Error processing action:', error);
      throw error;
    }
  }

  /**
   * Check for contradictions between actions
   * @param {Object} action - The scoring action to check
   * @returns {boolean} Whether contradictions were found
   */
  static async checkForContradictions(action) {
    try {
      // Only check statements and legislative actions
      if (!['public_statements', 'legislative_action'].includes(action.category)) {
        return false;
      }
      
      let contradictionFound = false;
      let contradictionNotes = '';
      
      if (action.category === 'public_statements') {
        // Look for contradicting legislative actions
        const contradictingActions = await ScoringAction.findAll({
          where: {
            politician_id: action.politician_id,
            category: 'legislative_action',
            verification_status: 'verified',
            // Add specific conditions for contradiction based on your criteria
          },
          limit: 5
        });
        
        if (contradictingActions.length > 0) {
          contradictionFound = true;
          contradictionNotes = `Statement contradicts legislative actions: ${contradictingActions.map(a => a.id).join(', ')}`;
        }
      } else if (action.category === 'legislative_action') {
        // Look for contradicting statements
        const contradictingStatements = await ScoringAction.findAll({
          where: {
            politician_id: action.politician_id,
            category: 'public_statements',
            verification_status: 'verified',
            // Add specific conditions for contradiction based on your criteria
          },
          limit: 5
        });
        
        if (contradictingStatements.length > 0) {
          contradictionFound = true;
          contradictionNotes = `Legislative action contradicts statements: ${contradictingStatements.map(a => a.id).join(', ')}`;
        }
      }
      
      if (contradictionFound) {
        action.contradiction_flag = true;
        action.contradiction_notes = contradictionNotes;
        await action.save();
      }
      
      return contradictionFound;
    } catch (error) {
      console.error('Error checking for contradictions:', error);
      return false;
    }
  }

  /**
   * Recalculate scores for a politician using the enhanced methodology
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
        order: [['action_date', 'DESC']],
        include: [{
          model: EvidenceSource,
          as: 'evidenceSources'
        }]
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
        // Update time value and performance modifier
        action.time_value = this.calculateTimeValue(action.action_date);
        action.performance_modifier = this.calculatePerformanceModifier(action);
        
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
            // Apply both time decay and performance modifier
            const weightedPoints = action.points * action.time_value * action.performance_modifier;
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
      
      // Calculate enhanced metrics
      const strategicIntegrityScore = this.calculateStrategicIntegrity(actions);
      const infrastructureUnderstandingScore = await this.calculateInfrastructureUnderstanding(actions, politicianId);
      const performanceVsImpactScore = this.calculatePerformanceVsImpact(actions);
      
      // Add recency bonus if applicable
      const recencyBonus = this.calculateRecencyBonus(lastActivityDate);
      let totalScore = Math.round(weightedTotal) + recencyBonus;
      
      // Ensure score is within 0-100 range
      totalScore = Math.min(100, Math.max(0, totalScore));
      
      // Calculate days of silence
      const daysOfSilence = this.calculateDaysOfSilence(lastActivityDate);
      
      // Determine resistance level
      const resistanceLevel = this.determineResistanceLevel({
        total_score: totalScore,
        strategic_integrity_score: strategicIntegrityScore,
        infrastructure_understanding_score: infrastructureUnderstandingScore,
        performance_vs_impact_score: performanceVsImpactScore
      });
      
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
          strategic_integrity_score: strategicIntegrityScore,
          infrastructure_understanding_score: infrastructureUnderstandingScore,
          performance_vs_impact_score: performanceVsImpactScore,
          resistance_level: resistanceLevel,
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
          strategic_integrity_score: strategicIntegrityScore,
          infrastructure_understanding_score: infrastructureUnderstandingScore,
          performance_vs_impact_score: performanceVsImpactScore,
          resistance_level: resistanceLevel,
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
      strategic_integrity_score: 50, // Neutral
      infrastructure_understanding_score: 50, // Neutral
      performance_vs_impact_score: 50, // Neutral
      resistance_level: 'Complicit Enabler', // Default
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
   * Get politicians by resistance level
   * @param {string} level - Resistance level
   * @param {number} limit - Number of politicians to return
   * @returns {Array} Politicians with the specified resistance level
   */
  static async getPoliticiansByResistanceLevel(level, limit = 20) {
    try {
      return await PoliticianScore.findAll({
        where: { resistance_level: level },
        limit,
        order: [['total_score', 'DESC']],
        include: [{
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position', 'photo_url'],
          include: [{
            model: PoliticianCommittee,
            as: 'committees',
            attributes: ['committee_name', 'leadership_position']
          }]
        }]
      });
    } catch (error) {
      console.error(`Error getting politicians by resistance level ${level}:`, error);
      throw error;
    }
  }

  /**
   * Get detailed assessment for a politician
   * @param {string} politicianId - UUID of the politician
   * @returns {Object} Detailed assessment
   */
  static async getDetailedAssessment(politicianId) {
    try {
      // Get politician
      const politician = await Politician.findByPk(politicianId);
      if (!politician) {
        throw new Error('Politician not found');
      }
      
      // Get politician score
      const politicianScore = await PoliticianScore.findOne({
        where: { politician_id: politicianId }
      });
      
      // Get committees
      const committees = await PoliticianCommittee.findAll({
        where: { politician_id: politicianId }
      });
      
      // Get recent actions
      const recentActions = await ScoringAction.findAll({
        where: { 
          politician_id: politicianId,
          verification_status: 'verified'
        },
        order: [['action_date', 'DESC']],
        limit: 10,
        include: [{
          model: EvidenceSource,
          as: 'evidenceSources'
        }]
      });
      
      // Get contradictions
      const contradictions = await ScoringAction.findAll({
        where: { 
          politician_id: politicianId,
          contradiction_flag: true
        },
        limit: 5,
        include: [{
          model: EvidenceSource,
          as: 'evidenceSources'
        }]
      });
      
      // Get score history
      const scoreHistory = await ScoreHistory.findAll({
        where: { politician_id: politicianId },
        order: [['recorded_date', 'DESC']],
        limit: 30
      });
      
      // Build assessment object
      const assessment = {
        politician: {
          id: politician.id,
          name: politician.name,
          party: politician.party,
          state: politician.state,
          position: politician.position,
          photo_url: politician.photo_url,
          committees: committees.map(c => ({
            name: c.committee_name,
            leadership_position: c.leadership_position
          }))
        },
        scoring_data: {
          total_score: politicianScore ? politicianScore.total_score : 0,
          category_scores: {
            public_statements: politicianScore ? politicianScore.public_statements_score : 0,
            legislative_action: politicianScore ? politicianScore.legislative_action_score : 0,
            public_engagement: politicianScore ? politicianScore.public_engagement_score : 0,
            social_media: politicianScore ? politicianScore.social_media_score : 0,
            consistency: politicianScore ? politicianScore.consistency_score : 0
          },
          enhanced_metrics: {
            strategic_integrity: politicianScore ? politicianScore.strategic_integrity_score : 50,
            infrastructure_understanding: politicianScore ? politicianScore.infrastructure_understanding_score : 50,
            performance_vs_impact: politicianScore ? politicianScore.performance_vs_impact_score : 50
          }
        },
        temporal_data: {
          days_of_silence: politicianScore ? politicianScore.days_of_silence : 999,
          last_activity_date: politicianScore ? politicianScore.last_activity_date : null,
          actions_last_14_days: recentActions.filter(a => {
            const actionDate = new Date(a.action_date);
            const now = new Date();
            const daysDifference = Math.floor((now - actionDate) / (1000 * 60 * 60 * 24));
            return daysDifference <= 14;
          }).length
        },
        evaluation: {
          status: politicianScore ? politicianScore.getStatus() : 'UNKNOWN',
          resistance_level: politicianScore ? politicianScore.getResistanceLevel() : 'Complicit Enabler',
          recent_actions: recentActions.map(a => ({
            id: a.id,
            category: a.category,
            action_type: a.action_type,
            description: a.description,
            date: a.action_date,
            points: a.points,
            strategic_value: a.strategic_value,
            impact_level: a.impact_level,
            has_action_follow_up: a.has_action_follow_up,
            performance_modifier: a.performance_modifier,
            sources: a.evidenceSources ? a.evidenceSources.map(s => ({
              url: s.source_url,
              type: s.source_type,
              confidence: s.confidence_rating
            })) : []
          })),
          contradictions: contradictions.map(a => ({
            id: a.id,
            description: a.description,
            date: a.action_date,
            notes: a.contradiction_notes
          })),
          score_history: scoreHistory.map(h => ({
            date: h.recorded_date,
            total_score: h.total_score,
            public_statements_score: h.public_statements_score,
            legislative_action_score: h.legislative_action_score,
            public_engagement_score: h.public_engagement_score,
            social_media_score: h.social_media_score,
            consistency_score: h.consistency_score
          }))
        }
      };
      
      return assessment;
    } catch (error) {
      console.error('Error getting detailed assessment:', error);
      throw error;
    }
  }
}

module.exports = EnhancedScoringService;
