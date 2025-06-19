const EnhancedScoringService = require('../services/enhancedScoringService');
const { ScoringAction, Politician, PoliticianCommittee, EvidenceSource } = require('../models');

/**
 * Enhanced Scoring Controller
 * Handles API requests related to the enhanced scoring system
 */
class EnhancedScoringController {
  /**
   * Get detailed assessment for a politician
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getDetailedAssessment(req, res) {
    try {
      const { politicianId } = req.params;
      
      if (!politicianId) {
        return res.status(400).json({ error: 'Politician ID is required' });
      }
      
      const assessment = await EnhancedScoringService.getDetailedAssessment(politicianId);
      
      return res.json(assessment);
    } catch (error) {
      console.error('Error getting detailed assessment:', error);
      return res.status(500).json({ error: 'Failed to get detailed assessment' });
    }
  }

  /**
   * Get politicians by resistance level
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPoliticiansByResistanceLevel(req, res) {
    try {
      const { level } = req.params;
      const { limit = 20 } = req.query;
      
      if (!level) {
        return res.status(400).json({ error: 'Resistance level is required' });
      }
      
      // Validate resistance level
      const validLevels = ['Defender', 'Active Resistor', 'Inconsistent Advocate', 'Complicit Enabler'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({ error: 'Invalid resistance level' });
      }
      
      const politicians = await EnhancedScoringService.getPoliticiansByResistanceLevel(level, parseInt(limit));
      
      return res.json(politicians);
    } catch (error) {
      console.error('Error getting politicians by resistance level:', error);
      return res.status(500).json({ error: 'Failed to get politicians by resistance level' });
    }
  }

  /**
   * Submit a new scoring action with enhanced metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async submitScoringAction(req, res) {
    try {
      const {
        politician_id,
        action_type,
        action_date,
        description,
        points,
        category,
        sub_category,
        strategic_value,
        has_action_follow_up,
        impact_level,
        risk_level,
        strategic_function,
        sources
      } = req.body;
      
      // Validate required fields
      if (!politician_id || !action_type || !action_date || !description || !points || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create the scoring action
      const action = await ScoringAction.create({
        politician_id,
        action_type,
        action_date,
        description,
        points,
        category,
        sub_category,
        strategic_value,
        has_action_follow_up: has_action_follow_up || false,
        impact_level,
        risk_level,
        strategic_function,
        verification_status: 'pending',
        created_by: req.user ? req.user.id : null
      });
      
      // Add evidence sources if provided
      if (sources && Array.isArray(sources) && sources.length > 0) {
        const evidenceSources = sources.map(source => ({
          scoring_action_id: action.id,
          source_url: source.url,
          source_type: source.type,
          confidence_rating: source.confidence || 5
        }));
        
        await EvidenceSource.bulkCreate(evidenceSources);
      }
      
      return res.status(201).json(action);
    } catch (error) {
      console.error('Error submitting scoring action:', error);
      return res.status(500).json({ error: 'Failed to submit scoring action' });
    }
  }

  /**
   * Verify a scoring action
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async verifyScoringAction(req, res) {
    try {
      const { actionId } = req.params;
      
      if (!actionId) {
        return res.status(400).json({ error: 'Action ID is required' });
      }
      
      // Find the action
      const action = await ScoringAction.findByPk(actionId);
      
      if (!action) {
        return res.status(404).json({ error: 'Scoring action not found' });
      }
      
      // Verify the action
      await action.verify(req.user.id);
      
      // Process the action with enhanced metrics
      const processedAction = await EnhancedScoringService.processAction(action);
      
      return res.json(processedAction);
    } catch (error) {
      console.error('Error verifying scoring action:', error);
      return res.status(500).json({ error: 'Failed to verify scoring action' });
    }
  }

  /**
   * Reject a scoring action
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async rejectScoringAction(req, res) {
    try {
      const { actionId } = req.params;
      const { reason } = req.body;
      
      if (!actionId) {
        return res.status(400).json({ error: 'Action ID is required' });
      }
      
      // Find the action
      const action = await ScoringAction.findByPk(actionId);
      
      if (!action) {
        return res.status(404).json({ error: 'Scoring action not found' });
      }
      
      // Reject the action
      await action.reject(req.user.id);
      
      // Add rejection reason if provided
      if (reason) {
        action.contradiction_notes = reason;
        await action.save();
      }
      
      return res.json(action);
    } catch (error) {
      console.error('Error rejecting scoring action:', error);
      return res.status(500).json({ error: 'Failed to reject scoring action' });
    }
  }

  /**
   * Add committee membership for a politician
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async addCommitteeMembership(req, res) {
    try {
      const { politicianId } = req.params;
      const { committee_name, leadership_position } = req.body;
      
      if (!politicianId || !committee_name) {
        return res.status(400).json({ error: 'Politician ID and committee name are required' });
      }
      
      // Check if politician exists
      const politician = await Politician.findByPk(politicianId);
      
      if (!politician) {
        return res.status(404).json({ error: 'Politician not found' });
      }
      
      // Create committee membership
      const committee = await PoliticianCommittee.create({
        politician_id: politicianId,
        committee_name,
        leadership_position
      });
      
      return res.status(201).json(committee);
    } catch (error) {
      console.error('Error adding committee membership:', error);
      return res.status(500).json({ error: 'Failed to add committee membership' });
    }
  }

  /**
   * Get committee memberships for a politician
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCommitteeMemberships(req, res) {
    try {
      const { politicianId } = req.params;
      
      if (!politicianId) {
        return res.status(400).json({ error: 'Politician ID is required' });
      }
      
      // Get committee memberships
      const committees = await PoliticianCommittee.findAll({
        where: { politician_id: politicianId }
      });
      
      return res.json(committees);
    } catch (error) {
      console.error('Error getting committee memberships:', error);
      return res.status(500).json({ error: 'Failed to get committee memberships' });
    }
  }

  /**
   * Recalculate scores for all politicians
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async recalculateAllScores(req, res) {
    try {
      const count = await EnhancedScoringService.recalculateAllScores();
      
      return res.json({ message: `Recalculated scores for ${count} politicians` });
    } catch (error) {
      console.error('Error recalculating all scores:', error);
      return res.status(500).json({ error: 'Failed to recalculate scores' });
    }
  }

  /**
   * Get contradictions for a politician
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getContradictions(req, res) {
    try {
      const { politicianId } = req.params;
      
      if (!politicianId) {
        return res.status(400).json({ error: 'Politician ID is required' });
      }
      
      // Get contradictions
      const contradictions = await ScoringAction.findAll({
        where: { 
          politician_id: politicianId,
          contradiction_flag: true
        },
        include: [{
          model: EvidenceSource,
          as: 'evidenceSources'
        }]
      });
      
      return res.json(contradictions);
    } catch (error) {
      console.error('Error getting contradictions:', error);
      return res.status(500).json({ error: 'Failed to get contradictions' });
    }
  }
}

module.exports = EnhancedScoringController;
