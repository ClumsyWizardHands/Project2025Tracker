require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Database configuration
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'project2025tracker';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

// Initialize Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false
});

// Define models
const Politician = sequelize.define('Politician', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  external_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  party: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chamber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  office: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twitter_account: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facebook_account: {
    type: DataTypes.STRING,
    allowNull: true
  },
  youtube_account: {
    type: DataTypes.STRING,
    allowNull: true
  },
  leadership_role: {
    type: DataTypes.STRING,
    allowNull: true
  },
  committees: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  next_election: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const PoliticianScore = sequelize.define('PoliticianScore', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  politician_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Politicians',
      key: 'id'
    }
  },
  total_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  public_statements_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  legislative_action_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  public_engagement_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  social_media_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  consistency_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data_status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

const Statement = sequelize.define('Statement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  politician_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Politicians',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Define relationships
Politician.hasOne(PoliticianScore, { foreignKey: 'politician_id' });
PoliticianScore.belongsTo(Politician, { foreignKey: 'politician_id' });

Politician.hasMany(Statement, { foreignKey: 'politician_id' });
Statement.belongsTo(Politician, { foreignKey: 'politician_id' });

// Load data
const loadCongressMembers = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/congress_members.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading congress members data:', error.message);
    return [];
  }
};

const loadPoliticianScores = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/politician_scores.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading politician scores data:', error.message);
    return [];
  }
};

const loadResearchResults = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/research_results.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading research results:', error.message);
    return [];
  }
};

// Main function to import data
async function importData() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models with database
    console.log('Syncing models with database...');
    await sequelize.sync({ force: true }); // This will drop tables if they exist
    
    // Load data
    console.log('Loading data...');
    const congressMembers = loadCongressMembers();
    const politicianScores = loadPoliticianScores();
    const researchResults = loadResearchResults();
    
    if (congressMembers.length === 0) {
      console.error('No congress members data found. Please run fetch_congress_members.js first.');
      return;
    }
    
    if (politicianScores.length === 0) {
      console.error('No politician scores data found. Please run score_politicians.js first.');
      return;
    }
    
    // Import politicians
    console.log(`Importing ${congressMembers.length} politicians...`);
    const politicianMap = new Map(); // Map external IDs to database IDs
    
    for (const member of congressMembers) {
      const politician = await Politician.create({
        external_id: member.id,
        name: member.full_name,
        party: member.party,
        state: member.state,
        district: member.district,
        chamber: member.chamber,
        office: member.office,
        phone: member.phone,
        url: member.url,
        twitter_account: member.twitter_account,
        facebook_account: member.facebook_account,
        youtube_account: member.youtube_account,
        leadership_role: member.leadership_role,
        committees: member.committees,
        next_election: member.next_election
      });
      
      politicianMap.set(member.id, politician.id);
    }
    
    // Import scores
    console.log(`Importing ${politicianScores.length} politician scores...`);
    
    for (const score of politicianScores) {
      const dbPoliticianId = politicianMap.get(score.politician_id);
      
      if (!dbPoliticianId) {
        console.warn(`No matching politician found for ID ${score.politician_id}`);
        continue;
      }
      
      await PoliticianScore.create({
        politician_id: dbPoliticianId,
        total_score: score.overall_score,
        public_statements_score: score.public_statements_score,
        legislative_action_score: score.legislative_action_score,
        public_engagement_score: score.public_engagement_score,
        social_media_score: score.social_media_score,
        consistency_score: score.consistency_score,
        data_status: score.data_status
      });
    }
    
    // Import statements
    console.log('Importing statements...');
    let statementCount = 0;
    
    for (const result of researchResults) {
      const dbPoliticianId = politicianMap.get(result.politician_id);
      
      if (!dbPoliticianId) {
        console.warn(`No matching politician found for ID ${result.politician_id}`);
        continue;
      }
      
      // Import public statements
      for (const statement of result.public_statements) {
        await Statement.create({
          politician_id: dbPoliticianId,
          type: statement.type,
          title: statement.title,
          content: statement.snippet,
          source: statement.source,
          url: statement.url,
          date: statement.date
        });
        
        statementCount++;
      }
      
      // Import social media posts
      for (const post of result.social_media_posts) {
        await Statement.create({
          politician_id: dbPoliticianId,
          type: 'social_media',
          content: post.content,
          source: 'Twitter',
          url: post.url,
          date: post.date
        });
        
        statementCount++;
      }
    }
    
    console.log(`Imported ${statementCount} statements.`);
    console.log('Data import completed successfully.');
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the main function
importData().catch(console.error);
