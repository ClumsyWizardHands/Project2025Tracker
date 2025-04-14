const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * ScoreHistory model
 * @typedef {Object} ScoreHistory
 * @property {string} id - UUID primary key
 * @property {string} politician_id - UUID foreign key to politicians table
 * @property {number} total_score - Overall score (0-100)
 * @property {number} public_statements_score - Public statements score (0-100)
 * @property {number} legislative_action_score - Legislative action score (0-100)
 * @property {number} public_engagement_score - Public engagement score (0-100)
 * @property {number} social_media_score - Social media score (0-100)
 * @property {number} consistency_score - Consistency score (0-100)
 * @property {number} days_of_silence - Days since last activity
 * @property {Date} recorded_date - Date when this score was recorded
 * @property {Date} created_at - Creation timestamp
 */
const ScoreHistory = sequelize.define(
  'ScoreHistory',
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
    recorded_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'score_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // No updated_at field for historical records
  }
);

// Define associations
ScoreHistory.associate = (models) => {
  // A score history entry belongs to a politician
  ScoreHistory.belongsTo(models.Politician, {
    foreignKey: 'politician_id',
    as: 'politician',
  });
};

// Static methods
ScoreHistory.findByPoliticianId = async function(politicianId, limit = 30) {
  return await this.findAll({
    where: { politician_id: politicianId },
    order: [['recorded_date', 'DESC']],
    limit
  });
};

ScoreHistory.getScoreTrend = async function(politicianId, days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.findAll({
    where: { 
      politician_id: politicianId,
      recorded_date: {
        [sequelize.Sequelize.Op.gte]: startDate
      }
    },
    order: [['recorded_date', 'ASC']],
    attributes: ['recorded_date', 'total_score']
  });
};

module.exports = ScoreHistory;
