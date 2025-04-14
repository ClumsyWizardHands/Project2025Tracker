const { Politician, Statement, Score, Tag, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all politicians with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPoliticians = async (req, res) => {
  try {
    const { 
      party, 
      state, 
      position, 
      search, 
      sort = 'name', 
      order = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter conditions
    const whereConditions = {};
    
    if (party) {
      whereConditions.party = party;
    }
    
    if (state) {
      whereConditions.state = state;
    }
    
    if (position) {
      whereConditions.position = position;
    }
    
    if (search) {
      whereConditions.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Validate sort field
    const validSortFields = ['name', 'party', 'state', 'position', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    
    // Validate order direction
    const orderDirection = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get politicians with pagination
    const { count, rows: politicians } = await Politician.findAndCountAll({
      where: whereConditions,
      order: [[sortField, orderDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      data: {
        politicians,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all politicians error:', error);
    return res.status(500).json({
      error: {
        message: 'Error retrieving politicians',
        status: 500
      }
    });
  }
};

/**
 * Get a politician by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPoliticianById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const politician = await Politician.findByPk(id);
    
    if (!politician) {
      return res.status(404).json({
        error: {
          message: 'Politician not found',
          status: 404
        }
      });
    }
    
    return res.status(200).json({
      data: {
        politician
      }
    });
  } catch (error) {
    console.error('Get politician by ID error:', error);
    return res.status(500).json({
      error: {
        message: 'Error retrieving politician',
        status: 500
      }
    });
  }
};

/**
 * Create a new politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPolitician = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Access denied. Admin privileges required.',
          status: 403
        }
      });
    }
    
    const { 
      name, 
      party, 
      state, 
      position, 
      bio, 
      photo_url, 
      website_url, 
      twitter_handle 
    } = req.body;
    
    // Validate required fields
    if (!name || !party || !state || !position) {
      return res.status(400).json({
        error: {
          message: 'Name, party, state, and position are required',
          status: 400
        }
      });
    }
    
    // Create politician
    const politician = await Politician.create({
      name,
      party,
      state,
      position,
      bio,
      photo_url,
      website_url,
      twitter_handle
    });
    
    return res.status(201).json({
      message: 'Politician created successfully',
      data: {
        politician
      }
    });
  } catch (error) {
    console.error('Create politician error:', error);
    return res.status(500).json({
      error: {
        message: 'Error creating politician',
        status: 500
      }
    });
  }
};

/**
 * Update a politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePolitician = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Access denied. Admin privileges required.',
          status: 403
        }
      });
    }
    
    const { id } = req.params;
    const { 
      name, 
      party, 
      state, 
      position, 
      bio, 
      photo_url, 
      website_url, 
      twitter_handle 
    } = req.body;
    
    // Find politician
    const politician = await Politician.findByPk(id);
    
    if (!politician) {
      return res.status(404).json({
        error: {
          message: 'Politician not found',
          status: 404
        }
      });
    }
    
    // Update politician
    if (name) politician.name = name;
    if (party) politician.party = party;
    if (state) politician.state = state;
    if (position) politician.position = position;
    if (bio !== undefined) politician.bio = bio;
    if (photo_url !== undefined) politician.photo_url = photo_url;
    if (website_url !== undefined) politician.website_url = website_url;
    if (twitter_handle !== undefined) politician.twitter_handle = twitter_handle;
    
    await politician.save();
    
    return res.status(200).json({
      message: 'Politician updated successfully',
      data: {
        politician
      }
    });
  } catch (error) {
    console.error('Update politician error:', error);
    return res.status(500).json({
      error: {
        message: 'Error updating politician',
        status: 500
      }
    });
  }
};

/**
 * Delete a politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deletePolitician = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Access denied. Admin privileges required.',
          status: 403
        }
      });
    }
    
    const { id } = req.params;
    
    // Find politician
    const politician = await Politician.findByPk(id);
    
    if (!politician) {
      return res.status(404).json({
        error: {
          message: 'Politician not found',
          status: 404
        }
      });
    }
    
    // Delete politician (associated statements and scores will be deleted by cascade)
    await politician.destroy();
    
    return res.status(200).json({
      message: 'Politician deleted successfully'
    });
  } catch (error) {
    console.error('Delete politician error:', error);
    return res.status(500).json({
      error: {
        message: 'Error deleting politician',
        status: 500
      }
    });
  }
};

/**
 * Get all statements by a politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPoliticianStatements = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      verified, 
      search, 
      sort = 'date', 
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Check if politician exists
    const politician = await Politician.findByPk(id);
    
    if (!politician) {
      return res.status(404).json({
        error: {
          message: 'Politician not found',
          status: 404
        }
      });
    }
    
    // Build filter conditions
    const whereConditions = {
      politician_id: id
    };
    
    if (verified !== undefined) {
      whereConditions.is_verified = verified === 'true';
    }
    
    if (search) {
      whereConditions.content = {
        [Op.iLike]: `%${search}%`
      };
    }
    
    // Validate sort field
    const validSortFields = ['date', 'source_name', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'date';
    
    // Validate order direction
    const orderDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get statements with pagination
    const { count, rows: statements } = await Statement.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username', 'first_name', 'last_name'],
          required: false
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] },
          required: false
        }
      ],
      order: [[sortField, orderDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
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
    console.error('Get politician statements error:', error);
    return res.status(500).json({
      error: {
        message: 'Error retrieving statements',
        status: 500
      }
    });
  }
};

/**
 * Get all scores for a politician
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPoliticianScores = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;
    
    // Check if politician exists
    const politician = await Politician.findByPk(id);
    
    if (!politician) {
      return res.status(404).json({
        error: {
          message: 'Politician not found',
          status: 404
        }
      });
    }
    
    // Build filter conditions
    const whereConditions = {
      politician_id: id
    };
    
    if (category) {
      whereConditions.category = category;
    }
    
    // Get scores
    const scores = await Score.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'username', 'first_name', 'last_name'],
          required: false
        }
      ],
      order: [['category', 'ASC']]
    });
    
    return res.status(200).json({
      data: {
        scores
      }
    });
  } catch (error) {
    console.error('Get politician scores error:', error);
    return res.status(500).json({
      error: {
        message: 'Error retrieving scores',
        status: 500
      }
    });
  }
};
