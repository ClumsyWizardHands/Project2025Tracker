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
 * @property {number} strategic_integrity_score - Strategic integrity score (0-100)
 * @property {number} infrastructure_understanding_score - Infrastructure understanding score (0-100)
 * @property {number} performance_vs_impact_score - Performance vs impact score (0-100)
 * @property {string} resistance_level - Resistance level classification
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
      type: DataTypes.STRING(20),
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
    // New fields for enhanced scoring
    strategic_integrity_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    infrastructure_understanding_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    performance_vs_impact_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    resistance_level: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['Defender', 'Active Resistor', 'Inconsistent Advocate', 'Complicit Enabler']]
      }
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

// Get resistance level based on scores
PoliticianScore.prototype.getResistanceLevel = function() {
  if (this.resistance_level) {
    return this.resistance_level;
  }
  
  // Calculate resistance level if not already set
  if (this.total_score >= 80 && this.strategic_integrity_score >= 70) {
    return 'Defender';
  } else if (this.total_score >= 60) {
    return 'Active Resistor';
  } else if (this.total_score >= 40) {
    return 'Inconsistent Advocate';
  } else {
    return 'Complicit Enabler';
  }
};

// Get detailed assessment
PoliticianScore.prototype.getDetailedAssessment = function() {
  return {
    total_score: this.total_score,
    status: this.getStatus(),
    resistance_level: this.getResistanceLevel(),
    category_scores: {
      public_statements: this.public_statements_score,
      legislative_action: this.legislative_action_score,
      public_engagement: this.public_engagement_score,
      social_media: this.social_media_score,
      consistency: this.consistency_score
    },
    enhanced_metrics: {
      strategic_integrity: this.strategic_integrity_score,
      infrastructure_understanding: this.infrastructure_understanding_score,
      performance_vs_impact: this.performance_vs_impact_score
    },
    temporal_data: {
      days_of_silence: this.days_of_silence,
      last_activity_date: this.last_activity_date,
      last_calculated: this.last_calculated
    }
  };
};

// Static methods
PoliticianScore.findByPoliticianId = async function(politicianId) {
  return await this.findOne({
    where: { politician_id: politicianId }
  });
};

// Get politicians by resistance level
PoliticianScore.findByResistanceLevel = async function(level, limit = 20) {
  return await this.findAll({
    where: { resistance_level: level },
    limit,
    order: [['total_score', 'DESC']],
    include: [{
      model: sequelize.models.Politician,
      as: 'politician',
      attributes: ['id', 'name', 'party', 'state', 'position', 'photo_url']
    }]
  });
};

module.exports = PoliticianScore;
