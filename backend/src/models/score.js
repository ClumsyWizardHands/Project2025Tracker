const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Score model
 * @typedef {Object} Score
 * @property {string} id - UUID primary key
 * @property {string} politician_id - UUID foreign key to politicians table
 * @property {number} score - Numeric score (0-10)
 * @property {string} category - Category of the score
 * @property {string} methodology - Description of the scoring methodology
 * @property {Date} last_updated - When the score was last updated
 * @property {string} updated_by - UUID of the user who updated the score
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const Score = sequelize.define(
  'Score',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    politician_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'politicians',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    score: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      validate: {
        min: 0,
        max: 10,
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    methodology: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_by: {
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
    tableName: 'scores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
Score.associate = (models) => {
  // A score belongs to a politician
  Score.belongsTo(models.Politician, {
    foreignKey: 'politician_id',
    as: 'politician',
  });

  // A score belongs to a user (who updated it)
  Score.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updater',
  });
};

module.exports = Score;
