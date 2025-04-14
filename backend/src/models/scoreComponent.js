const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * ScoreComponent model
 * @typedef {Object} ScoreComponent
 * @property {string} id - UUID primary key
 * @property {string} politician_id - UUID foreign key to politicians table
 * @property {string} category - Main category (e.g., public_statements, legislative_action)
 * @property {string} sub_category - Optional sub-category for more detailed breakdown
 * @property {number} score - Component score (0-100)
 * @property {number} weight - Weight of this component in the overall score (0-1)
 * @property {Date} last_updated - When the component was last updated
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const ScoreComponent = sequelize.define(
  'ScoreComponent',
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
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    weight: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    last_updated: {
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
    tableName: 'score_components',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
ScoreComponent.associate = (models) => {
  // A score component belongs to a politician
  ScoreComponent.belongsTo(models.Politician, {
    foreignKey: 'politician_id',
    as: 'politician',
  });
};

// Static methods
ScoreComponent.findByPoliticianAndCategory = async function(politicianId, category) {
  return await this.findAll({
    where: { 
      politician_id: politicianId,
      category
    },
    order: [['sub_category', 'ASC']]
  });
};

ScoreComponent.getComponentBreakdown = async function(politicianId) {
  return await this.findAll({
    where: { politician_id: politicianId },
    order: [['category', 'ASC'], ['sub_category', 'ASC']]
  });
};

module.exports = ScoreComponent;
