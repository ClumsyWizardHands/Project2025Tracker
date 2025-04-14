const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Politician model
 * @typedef {Object} Politician
 * @property {string} id - UUID primary key
 * @property {string} name - Politician's full name
 * @property {string} party - Political party affiliation
 * @property {string} state - State represented
 * @property {string} position - Current political position
 * @property {string} bio - Biographical information
 * @property {string} photo_url - URL to politician's photo
 * @property {string} website_url - URL to politician's website
 * @property {string} twitter_handle - Twitter handle without @
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const Politician = sequelize.define(
  'Politician',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    party: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    website_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    twitter_handle: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    tableName: 'politicians',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
Politician.associate = (models) => {
  // A politician has many statements
  Politician.hasMany(models.Statement, {
    foreignKey: 'politician_id',
    as: 'statements',
  });

  // A politician has many scores
  Politician.hasMany(models.Score, {
    foreignKey: 'politician_id',
    as: 'scores',
  });
};

module.exports = Politician;
