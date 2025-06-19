const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Politician = sequelize.define(
  'Politician',
  {
    id: {
      type: DataTypes.STRING(20),
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
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  
  // A politician has one politician score
  Politician.hasOne(models.PoliticianScore, {
    foreignKey: 'politician_id',
    as: 'politicianScore',
  });
  
  // A politician has many scoring actions
  Politician.hasMany(models.ScoringAction, {
    foreignKey: 'politician_id',
    as: 'scoringActions',
  });
  
  // A politician has many committee memberships
  Politician.hasMany(models.PoliticianCommittee, {
    foreignKey: 'politician_id',
    as: 'committees',
  });
};

// Instance methods
Politician.prototype.getFullProfile = async function() {
  const politicianScore = await sequelize.models.PoliticianScore.findOne({
    where: { politician_id: this.id }
  });
  
  const committees = await sequelize.models.PoliticianCommittee.findAll({
    where: { politician_id: this.id }
  });
  
  const recentActions = await sequelize.models.ScoringAction.findAll({
    where: { 
      politician_id: this.id,
      verification_status: 'verified'
    },
    order: [['action_date', 'DESC']],
    limit: 5,
    include: [{
      model: sequelize.models.EvidenceSource,
      as: 'evidenceSources'
    }]
  });
  
  const contradictions = await sequelize.models.ScoringAction.findAll({
    where: { 
      politician_id: this.id,
      contradiction_flag: true
    },
    limit: 5
  });
  
  return {
    id: this.id,
    name: this.name,
    party: this.party,
    state: this.state,
    position: this.position,
    bio: this.bio,
    photo_url: this.photo_url,
    website_url: this.website_url,
    twitter_handle: this.twitter_handle,
    score: politicianScore ? politicianScore.getDetailedAssessment() : null,
    committees: committees.map(c => ({
      name: c.committee_name,
      leadership: c.leadership_position
    })),
    recent_actions: recentActions,
    contradictions: contradictions,
    status: politicianScore ? politicianScore.getStatus() : 'UNKNOWN',
    resistance_level: politicianScore ? politicianScore.getResistanceLevel() : null
  };
};

module.exports = Politician;
