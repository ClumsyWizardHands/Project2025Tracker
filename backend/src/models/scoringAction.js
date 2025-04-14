const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * ScoringAction model
 * @typedef {Object} ScoringAction
 * @property {string} id - UUID primary key
 * @property {string} politician_id - UUID foreign key to politicians table
 * @property {string} action_type - Type of action (statement, vote, sponsorship, etc.)
 * @property {Date} action_date - Date when the action occurred
 * @property {string} description - Description of the action
 * @property {string} source_url - URL to the source of the action
 * @property {number} points - Points awarded for this action
 * @property {string} category - Category of the action
 * @property {string} sub_category - Optional sub-category for more detailed breakdown
 * @property {string} verification_status - Status of verification (pending, verified, rejected)
 * @property {string} verified_by - UUID of the user who verified the action
 * @property {Date} verified_at - When the action was verified
 * @property {number} time_value - Time decay value (0-1)
 * @property {string} created_by - UUID of the user who created the action
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const ScoringAction = sequelize.define(
  'ScoringAction',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    politician_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'politicians',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    action_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['statement', 'vote', 'sponsorship', 'social_post', 'public_event', 'interview', 'other']]
      }
    },
    action_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['public_statements', 'legislative_action', 'public_engagement', 'social_media', 'consistency']]
      }
    },
    sub_category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    verification_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'verified', 'rejected']]
      }
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    time_value: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 1.0,
      validate: {
        min: 0,
        max: 1,
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'scoring_actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
ScoringAction.associate = (models) => {
  // A scoring action belongs to a politician
  ScoringAction.belongsTo(models.Politician, {
    foreignKey: 'politician_id',
    as: 'politician',
  });

  // A scoring action belongs to a user (who verified it)
  ScoringAction.belongsTo(models.User, {
    foreignKey: 'verified_by',
    as: 'verifier',
  });

  // A scoring action belongs to a user (who created it)
  ScoringAction.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
};

// Instance methods
ScoringAction.prototype.verify = async function(userId) {
  this.verification_status = 'verified';
  this.verified_by = userId;
  this.verified_at = new Date();
  await this.save();
  return this;
};

ScoringAction.prototype.reject = async function(userId) {
  this.verification_status = 'rejected';
  this.verified_by = userId;
  this.verified_at = new Date();
  await this.save();
  return this;
};

ScoringAction.prototype.calculateTimeValue = function() {
  const now = new Date();
  const actionDate = new Date(this.action_date);
  const daysDifference = Math.floor((now - actionDate) / (1000 * 60 * 60 * 24));
  
  if (daysDifference <= 30) {
    return 1.0; // 100% value for 0-30 days
  } else if (daysDifference <= 90) {
    return 0.75; // 75% value for 31-90 days
  } else if (daysDifference <= 180) {
    return 0.5; // 50% value for 91-180 days
  } else {
    return 0.25; // 25% value for 180+ days
  }
};

// Static methods
ScoringAction.findByPoliticianId = async function(politicianId, options = {}) {
  const { category, verification_status, limit = 50, offset = 0 } = options;
  
  const whereConditions = { politician_id: politicianId };
  
  if (category) {
    whereConditions.category = category;
  }
  
  if (verification_status) {
    whereConditions.verification_status = verification_status;
  }
  
  return await this.findAll({
    where: whereConditions,
    order: [['action_date', 'DESC'], ['created_at', 'DESC']],
    limit,
    offset,
    include: [
      {
        model: sequelize.models.User,
        as: 'creator',
        attributes: ['id', 'username']
      },
      {
        model: sequelize.models.User,
        as: 'verifier',
        attributes: ['id', 'username']
      }
    ]
  });
};

ScoringAction.getPendingActions = async function(limit = 20) {
  return await this.findAll({
    where: { verification_status: 'pending' },
    order: [['created_at', 'ASC']],
    limit,
    include: [
      {
        model: sequelize.models.Politician,
        as: 'politician',
        attributes: ['id', 'name', 'party', 'state']
      },
      {
        model: sequelize.models.User,
        as: 'creator',
        attributes: ['id', 'username']
      }
    ]
  });
};

ScoringAction.getRecentVerifiedActions = async function(limit = 20) {
  return await this.findAll({
    where: { verification_status: 'verified' },
    order: [['verified_at', 'DESC']],
    limit,
    include: [
      {
        model: sequelize.models.Politician,
        as: 'politician',
        attributes: ['id', 'name', 'party', 'state']
      },
      {
        model: sequelize.models.User,
        as: 'verifier',
        attributes: ['id', 'username']
      }
    ]
  });
};

module.exports = ScoringAction;
