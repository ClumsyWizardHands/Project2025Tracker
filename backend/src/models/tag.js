const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Tag model
 * @typedef {Object} Tag
 * @property {string} id - UUID primary key
 * @property {string} name - Unique tag name
 * @property {string} description - Tag description
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const Tag = sequelize.define(
  'Tag',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: 'tags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
Tag.associate = (models) => {
  // A tag belongs to many statements through statement_tags
  Tag.belongsToMany(models.Statement, {
    through: 'statement_tags',
    foreignKey: 'tag_id',
    otherKey: 'statement_id',
    as: 'statements',
  });
};

module.exports = Tag;
