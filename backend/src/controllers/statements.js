const { Statement, Politician, User, Tag } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all statements with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllStatements = async (req, res) => {
  try {
    const { 
      politician_id, 
      search, 
      start_date, 
      end_date, 
      is_verified,
      tag,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (politician_id) {
      whereConditions.politician_id = politician_id;
    }
    
    if (search) {
      whereConditions.content = {
        [Op.iLike]: `%${search}%`
      };
    }
    
    if (start_date || end_date) {
      whereConditions.date = {};
      
      if (start_date) {
        whereConditions.date[Op.gte] = new Date(start_date);
      }
      
      if (end_date) {
        whereConditions.date[Op.lte] = new Date(end_date);
      }
    }
    
    if (is_verified !== undefined) {
      whereConditions.is_verified = is_verified === 'true';
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Build include options
    const includeOptions = [
      {
        model: Politician,
        as: 'politician',
        attributes: ['id', 'name', 'party', 'state', 'position']
      },
      {
        model: User,
        as: 'verifier',
        attributes: ['id', 'username']
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }
    ];
    
    // Add tag filtering if provided
    if (tag) {
      includeOptions[2].where = { name: tag };
    }
    
    // Fetch statements with pagination
    const { count, rows: statements } = await Statement.findAndCountAll({
      where: whereConditions,
      include: includeOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
      distinct: true
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      success: true,
      data: {
        statements,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching statements:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statements'
    });
  }
};

/**
 * Get a statement by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getStatementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const statement = await Statement.findByPk(id, {
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!statement) {
      return res.status(404).json({
        success: false,
        error: 'Statement not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: statement
    });
  } catch (error) {
    console.error('Error fetching statement:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statement'
    });
  }
};

/**
 * Create a new statement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createStatement = async (req, res) => {
  try {
    const { 
      politician_id, 
      date, 
      content, 
      source_url, 
      source_name, 
      context,
      is_verified,
      tags
    } = req.body;
    
    // Validate required fields
    if (!politician_id || !date || !content || !source_url || !source_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: politician_id, date, content, source_url, source_name'
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
    
    // Create new statement
    const newStatement = await Statement.create({
      politician_id,
      date,
      content,
      source_url,
      source_name,
      context,
      is_verified: is_verified || false,
      verified_by: is_verified ? (req.user ? req.user.id : null) : null
    });
    
    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Find or create tags
      const tagPromises = tags.map(async (tagName) => {
        const [tag] = await Tag.findOrCreate({
          where: { name: tagName.trim().toLowerCase() }
        });
        return tag;
      });
      
      const createdTags = await Promise.all(tagPromises);
      
      // Associate tags with statement
      await newStatement.setTags(createdTags);
    }
    
    // Fetch the created statement with associations
    const statement = await Statement.findByPk(newStatement.id, {
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      data: statement
    });
  } catch (error) {
    console.error('Error creating statement:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create statement'
    });
  }
};

/**
 * Update a statement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      date, 
      content, 
      source_url, 
      source_name, 
      context,
      is_verified,
      tags
    } = req.body;
    
    // Find the statement
    const statement = await Statement.findByPk(id);
    
    if (!statement) {
      return res.status(404).json({
        success: false,
        error: 'Statement not found'
      });
    }
    
    // Update statement
    await statement.update({
      date: date || statement.date,
      content: content || statement.content,
      source_url: source_url || statement.source_url,
      source_name: source_name || statement.source_name,
      context: context !== undefined ? context : statement.context,
      is_verified: is_verified !== undefined ? is_verified : statement.is_verified,
      verified_by: is_verified ? (req.user ? req.user.id : statement.verified_by) : null
    });
    
    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Find or create tags
      const tagPromises = tags.map(async (tagName) => {
        const [tag] = await Tag.findOrCreate({
          where: { name: tagName.trim().toLowerCase() }
        });
        return tag;
      });
      
      const createdTags = await Promise.all(tagPromises);
      
      // Associate tags with statement
      await statement.setTags(createdTags);
    }
    
    // Fetch the updated statement with associations
    const updatedStatement = await Statement.findByPk(id, {
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedStatement
    });
  } catch (error) {
    console.error('Error updating statement:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update statement'
    });
  }
};

/**
 * Delete a statement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteStatement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the statement
    const statement = await Statement.findByPk(id);
    
    if (!statement) {
      return res.status(404).json({
        success: false,
        error: 'Statement not found'
      });
    }
    
    // Delete statement
    await statement.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Statement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting statement:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete statement'
    });
  }
};

/**
 * Verify a statement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyStatement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the statement
    const statement = await Statement.findByPk(id);
    
    if (!statement) {
      return res.status(404).json({
        success: false,
        error: 'Statement not found'
      });
    }
    
    // Update verification status
    await statement.update({
      is_verified: true,
      verified_by: req.user ? req.user.id : null
    });
    
    return res.status(200).json({
      success: true,
      message: 'Statement verified successfully',
      data: statement
    });
  } catch (error) {
    console.error('Error verifying statement:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify statement'
    });
  }
};

/**
 * Get statements by tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getStatementsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Find tag
    const tagRecord = await Tag.findOne({
      where: { name: tag.toLowerCase() }
    });
    
    if (!tagRecord) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    // Fetch statements with the tag
    const { count, rows: statements } = await Statement.findAndCountAll({
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          where: { id: tagRecord.id }
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
      distinct: true
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      success: true,
      data: {
        statements,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching statements by tag:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statements by tag'
    });
  }
};

/**
 * Get all tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch tags'
    });
  }
};

/**
 * Get recent statements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRecentStatements = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const statements = await Statement.findAll({
      include: [
        {
          model: Politician,
          as: 'politician',
          attributes: ['id', 'name', 'party', 'state', 'position']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      limit: parseInt(limit),
      order: [['date', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: statements
    });
  } catch (error) {
    console.error('Error fetching recent statements:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch recent statements'
    });
  }
};

/**
 * Get statements by politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getStatementsByPolitician = async (req, res) => {
  try {
    const { politician_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Check if politician exists
    const politician = await Politician.findByPk(politician_id);
    
    if (!politician) {
      return res.status(404).json({
        success: false,
        error: 'Politician not found'
      });
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Fetch statements
    const { count, rows: statements } = await Statement.findAndCountAll({
      where: { politician_id },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      success: true,
      data: {
        politician: {
          id: politician.id,
          name: politician.name,
          party: politician.party,
          state: politician.state,
          position: politician.position
        },
        statements,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching statements by politician:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statements by politician'
    });
  }
};

/**
 * Get statement statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getStatementStatistics = async (req, res) => {
  try {
    // Get total statements count
    const totalStatements = await Statement.count();
    
    // Get verified statements count
    const verifiedStatements = await Statement.count({
      where: { is_verified: true }
    });
    
    // Get statements by party
    const politicians = await Politician.findAll({
      attributes: ['party'],
      include: [
        {
          model: Statement,
          as: 'statements',
          attributes: []
        }
      ],
      group: ['party'],
      raw: true,
      nest: true,
      includeIgnoreAttributes: false,
      attributes: [
        'party',
        [sequelize.fn('COUNT', sequelize.col('statements.id')), 'statementCount']
      ]
    });
    
    // Format party statistics
    const statementsByParty = {};
    
    politicians.forEach(politician => {
      statementsByParty[politician.party] = parseInt(politician.statementCount);
    });
    
    // Get statements by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const statementsByMonth = await Statement.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        date: {
          [Op.gte]: sixMonthsAgo
        }
      },
      group: [sequelize.fn('date_trunc', 'month', sequelize.col('date'))],
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'ASC']],
      raw: true
    });
    
    // Format monthly statistics
    const monthlyStats = statementsByMonth.map(stat => ({
      month: new Date(stat.month).toISOString().substring(0, 7),
      count: parseInt(stat.count)
    }));
    
    return res.status(200).json({
      success: true,
      data: {
        totalStatements,
        verifiedStatements,
        verificationRate: totalStatements > 0 ? (verifiedStatements / totalStatements) * 100 : 0,
        statementsByParty,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching statement statistics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statement statistics'
    });
  }
};
