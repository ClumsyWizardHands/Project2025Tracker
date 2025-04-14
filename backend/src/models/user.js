const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User model
 * @typedef {Object} User
 * @property {string} id - UUID primary key
 * @property {string} username - Unique username
 * @property {string} email - Unique email address
 * @property {string} password - Hashed password
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * @property {string} role - User role (user, admin)
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 100],
      },
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'researcher', 'admin']],
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      // Hash password before saving
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance methods
User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Define associations
User.associate = (models) => {
  // A user has many verified statements
  User.hasMany(models.Statement, {
    foreignKey: 'verified_by',
    as: 'verifiedStatements',
  });

  // A user has many updated scores
  User.hasMany(models.Score, {
    foreignKey: 'updated_by',
    as: 'updatedScores',
  });
};

module.exports = User;
