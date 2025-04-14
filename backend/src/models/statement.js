const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Statement model
 * @typedef {Object} Statement
 * @property {string} id - UUID primary key
 * @property {string} politician_id - UUID foreign key to politicians table
 * @property {Date} date - Date of the statement
 * @property {string} content - Content of the statement
 * @property {string} source_url - URL to the source of the statement
 * @property {string} source_name - Name of the source
 * @property {string} context - Additional context for the statement
 * @property {boolean} is_verified - Whether the statement has been verified
 * @property {string} verified_by - UUID of the user who verified the statement
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const Statement = sequelize.define(
  'Statement',
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    source_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    source_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verified_by: {
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
    tableName: 'statements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
Statement.associate = (models) => {
  // A statement belongs to a politician
  Statement.belongsTo(models.Politician, {
    foreignKey: 'politician_id',
    as: 'politician',
  });

  // A statement belongs to a user (who verified it)
  Statement.belongsTo(models.User, {
    foreignKey: 'verified_by',
    as: 'verifier',
  });

  // A statement has many tags through statement_tags
  Statement.belongsToMany(models.Tag, {
    through: 'statement_tags',
    foreignKey: 'statement_id',
    otherKey: 'tag_id',
    as: 'tags',
  });
};

module.exports = Statement;
