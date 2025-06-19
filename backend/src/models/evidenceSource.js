const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * EvidenceSource model
 * @typedef {Object} EvidenceSource
 * @property {string} id - UUID primary key
 * @property {string} scoring_action_id - UUID foreign key to scoring_actions table
 * @property {string} source_url - URL to the source
 * @property {string} source_type - Type of source (official_record, investigative_journalism, first_party, social_media)
 * @property {number} confidence_rating - Confidence rating (1-10)
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const EvidenceSource = sequelize.define(
  'EvidenceSource',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    scoring_action_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'scoring_actions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    source_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
      },
    },
    source_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['official_record', 'investigative_journalism', 'first_party', 'social_media']],
      },
    },
    confidence_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
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
    tableName: 'evidence_sources',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
EvidenceSource.associate = (models) => {
  // An evidence source belongs to a scoring action
  EvidenceSource.belongsTo(models.ScoringAction, {
    foreignKey: 'scoring_action_id',
    as: 'scoringAction',
  });
};

// Static methods
EvidenceSource.findByScoringActionId = async function(scoringActionId) {
  return await this.findAll({
    where: { scoring_action_id: scoringActionId }
  });
};

// Get confidence weight based on source type
EvidenceSource.getConfidenceWeight = function(sourceType) {
  const weights = {
    'official_record': 1.0,
    'investigative_journalism': 0.8,
    'first_party': 0.6,
    'social_media': 0.4
  };
  
  return weights[sourceType] || 0.5;
};

module.exports = EvidenceSource;
