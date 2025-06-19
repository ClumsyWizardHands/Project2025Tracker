const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * PoliticianCommittee model
 * @typedef {Object} PoliticianCommittee
 * @property {string} id - UUID primary key
 * @property {string} politician_id - UUID foreign key to politicians table
 * @property {string} committee_name - Name of the committee
 * @property {string} leadership_position - Leadership position in the committee (if any)
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const PoliticianCommittee = sequelize.define(
  'PoliticianCommittee',
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
    committee_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    leadership_position: {
      type: DataTypes.STRING(100),
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
    tableName: 'politician_committees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
PoliticianCommittee.associate = (models) => {
  // A committee belongs to a politician
  PoliticianCommittee.belongsTo(models.Politician, {
    foreignKey: 'politician_id',
    as: 'politician',
  });
};

// Static methods
PoliticianCommittee.findByPoliticianId = async function(politicianId) {
  return await this.findAll({
    where: { politician_id: politicianId }
  });
};

module.exports = PoliticianCommittee;
