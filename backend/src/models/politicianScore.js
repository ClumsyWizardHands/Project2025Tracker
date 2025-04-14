const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * PoliticianScore model
 * @typedef {Object} PoliticianScore
 * @property {string} id - UUID primary key
 * @property {string} politician_id - UUID foreign key to politicians table
 * @property {number} total_score - Overall score (0-100)
 * @property {number} public_statements_score - Public statements score (0-100)
 * @property {number} legislative_action_score - Legislative action score (0-100)
 * @property {number} public_engagement_score - Public engagement score (0-100)
 * @property {number} social_media_score - Social media score (0-100)
 * @property {number} consistency_score - Consistency score (0-100)
 * @property {number} days_of_silence - Days since last activity
 * @property {Date} last_activity_date - Date of last recorded activity
 * @property {Date} last_calculated - When the score was last calculated
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const PoliticianScore = sequelize.define(
  'PoliticianScore',
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
    total_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    public_statements_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    legislative_action_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    public_engagement_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    social_media_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    consistency_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    days_of_silence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_activity_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    last_calculated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'politician_scores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
PoliticianScore.associate = (models) => {
  // A politician score belongs to a politician
  PoliticianScore.belongsTo(models.Politician, {
    foreignKey: 'politician_id',
    as: 'politician',
  });
};

// Instance methods
PoliticianScore.prototype.getStatus = function() {
  if (this.total_score >= 80) {
    return 'WHISTLEBLOWER';
  } else if (this.total_score >= 50) {
    return 'UNDER SURVEILLANCE';
  } else {
    return 'PERSON OF INTEREST';
  }
};

// Static methods
PoliticianScore.findByPoliticianId = async function(politicianId) {
  return await this.findOne({
    where: { politician_id: politicianId }
  });
};

module.exports = PoliticianScore;
