/**
 * Import Democratic Senators Data
 * 
 * This script processes JSON data about Democratic senators' positions on antidemocratic principles
 * and imports it into the Project 2025 Accountability Platform database.
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const { Politician, PoliticianScore, Statement, Tag } = require('../backend/src/models');
const sequelize = require('../backend/src/config/database');

// Constants
const DATA_FILE = path.join(__dirname, '../data/democratic_senators.json');
const LEADERBOARD_THRESHOLD = 75; // Threshold for "Top Performers" vs "Persons of Interest"

/**
 * Calculate scores for a politician based on their positions on antidemocratic principles
 */
function calculateScores(politician) {
  // Extract data
  const publicStatements = politician.positions_on_antidemocratic_principles.public_statements;
  const legislativeActions = politician.positions_on_antidemocratic_principles.legislative_actions;
  const publicEngagement = politician.positions_on_antidemocratic_principles.public_engagement;
  const socialMedia = politician.positions_on_antidemocratic_principles.social_media_activity;
  const consistency = politician.positions_on_antidemocratic_principles.consistency_analysis;
  
  // Calculate individual scores
  let publicStatementsScore = 0;
  let legislativeActionScore = 0;
  let publicEngagementScore = 0;
  let socialMediaScore = 0;
  let consistencyScore = 0;
  let recencyBonus = 0;
  
  // Public statements score (0-30 points)
  if (publicStatements.opposition_to_antidemocratic_movements === 'Strong') {
    publicStatementsScore = 25;
  } else if (publicStatements.opposition_to_antidemocratic_movements === 'Moderate') {
    publicStatementsScore = 15;
  } else if (publicStatements.opposition_to_antidemocratic_movements === 'Minimal') {
    publicStatementsScore = 7;
  }
  
  // Add points for breadth of statement categories
  const statementCategories = [
    'election_integrity_voting_rights',
    'january_6_events_investigations',
    'election_certification_processes',
    'democratic_checks_balances',
    'judicial_independence'
  ];
  
  let categoriesWithStatements = 0;
  statementCategories.forEach(category => {
    if (publicStatements[category] && Array.isArray(publicStatements[category]) && publicStatements[category].length > 0) {
      categoriesWithStatements++;
    }
  });
  
  publicStatementsScore += Math.min(5, categoriesWithStatements);
  publicStatementsScore = Math.min(30, publicStatementsScore);
  
  // Legislative action score (0-25 points)
  const sponsoredLegislation = legislativeActions.sponsored_legislation_promoting_democracy || [];
  const cosponsoredLegislation = legislativeActions.cosponsored_legislation_promoting_democracy || [];
  const keyVotes = legislativeActions.key_votes || [];
  
  if (sponsoredLegislation.length > 0) {
    legislativeActionScore = 15 + Math.min(10, sponsoredLegislation.length * 2);
  } else if (cosponsoredLegislation.length > 0) {
    legislativeActionScore = 10 + Math.min(5, cosponsoredLegislation.length);
  } else if (keyVotes.length > 0) {
    legislativeActionScore = 5 + Math.min(10, keyVotes.length);
  }
  
  legislativeActionScore = Math.min(25, legislativeActionScore);
  
  // Public engagement score (0-20 points)
  const events = publicEngagement.events_addressing_democracy || [];
  if (events.length > 0) {
    publicEngagementScore = 10 + Math.min(10, events.length * 2);
  }
  
  publicEngagementScore = Math.min(20, publicEngagementScore);
  
  // Social media score (0-15 points)
  const posts = socialMedia.relevant_posts || [];
  if (posts.length > 0) {
    socialMediaScore = 5 + Math.min(10, posts.length);
  }
  
  socialMediaScore = Math.min(15, socialMediaScore);
  
  // Consistency score (0-10 points)
  if (consistency.pattern_of_engagement === 'Consistent') {
    consistencyScore = 8;
  } else if (consistency.pattern_of_engagement === 'Recently Consistent') {
    consistencyScore = 5;
  } else if (consistency.pattern_of_engagement === 'Inconsistent') {
    consistencyScore = 3;
  }
  
  consistencyScore = Math.min(10, consistencyScore);
  
  // Recency bonus (0-5 points)
  // Check if any activity within the last 14 days
  const currentDate = new Date(politician.data_as_of_date || politician.last_updated);
  const fourteenDaysAgo = new Date(currentDate);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  // Check for recent statements
  for (const category of statementCategories) {
    if (publicStatements[category] && Array.isArray(publicStatements[category])) {
      for (const statement of publicStatements[category]) {
        if (statement.date) {
          const statementDate = new Date(statement.date);
          if (statementDate >= fourteenDaysAgo) {
            recencyBonus = 5;
            break;
          }
        }
      }
      if (recencyBonus > 0) break;
    }
  }
  
  // Calculate total score
  const totalScore = 
    publicStatementsScore + 
    legislativeActionScore + 
    publicEngagementScore + 
    socialMediaScore + 
    consistencyScore + 
    recencyBonus;
  
  return {
    total_score: totalScore,
    public_statements_score: publicStatementsScore,
    legislative_action_score: legislativeActionScore,
    public_engagement_score: publicEngagementScore,
    social_media_score: socialMediaScore,
    consistency_score: consistencyScore,
    recency_bonus: recencyBonus,
    leaderboard_category: totalScore >= LEADERBOARD_THRESHOLD ? 'Top Performer' : 'Person of Interest'
  };
}

/**
 * Format politician data for database insertion
 */
function formatPoliticianData(politician) {
  return {
    name: politician.basic_info.full_name,
    party: politician.basic_info.party === 'D' ? 'Democrat' : 
           politician.basic_info.party === 'R' ? 'Republican' : 
           politician.basic_info.party === 'I' ? 'Independent' : 
           politician.basic_info.party,
    state: politician.basic_info.state,
    position: politician.basic_info.chamber === 'Senate' ? 'Senator' : 
              politician.basic_info.chamber === 'House' ? 'Representative' : 
              politician.basic_info.chamber,
    bio: `${politician.basic_info.full_name} is a ${politician.basic_info.party === 'D' ? 'Democratic' : 
          politician.basic_info.party === 'R' ? 'Republican' : 
          politician.basic_info.party === 'I' ? 'Independent' : 
          politician.basic_info.party} ${politician.basic_info.chamber === 'Senate' ? 'Senator' : 
          politician.basic_info.chamber === 'House' ? 'Representative' : 
          politician.basic_info.chamber} from ${politician.basic_info.state}. ${politician.positions_on_antidemocratic_principles.summary_assessment}.`,
    photo_url: null, // Not provided in the data
    website_url: politician.basic_info.official_website,
    twitter_handle: null // Not directly provided in the data
  };
}

/**
 * Generate statements for a politician
 */
function generateStatements(politician, politicianId) {
  const statements = [];
  const publicStatements = politician.positions_on_antidemocratic_principles.public_statements;
  
  // Process each statement category
  const statementCategories = [
    'election_integrity_voting_rights',
    'january_6_events_investigations',
    'election_certification_processes',
    'democratic_checks_balances',
    'judicial_independence'
  ];
  
  for (const category of statementCategories) {
    if (publicStatements[category] && Array.isArray(publicStatements[category])) {
      for (const statement of publicStatements[category]) {
        statements.push({
          politician_id: politicianId,
          content: statement.quote_or_summary,
          source_name: statement.source_name,
          source_url: statement.source_url,
          date: statement.date,
          is_verified: true,
          tags: [category.replace(/_/g, ' ')]
        });
      }
    }
  }
  
  // Add a summary statement
  statements.push({
    politician_id: politicianId,
    content: `${politician.basic_info.full_name}'s overall stance: ${politician.positions_on_antidemocratic_principles.summary_assessment}`,
    source_name: 'Project 2025 Accountability Platform Analysis',
    source_url: null,
    date: politician.last_updated.split('T')[0],
    is_verified: true,
    tags: ['Summary', 'Analysis']
  });
  
  return statements;
}

/**
 * Import a single politician
 */
async function importPolitician(politician) {
  try {
    // Calculate scores
    const scores = calculateScores(politician);
    
    // Format politician data
    const politicianData = formatPoliticianData(politician);
    
    // Create or update politician record
    const [politicianRecord, created] = await Politician.findOrCreate({
      where: { name: politicianData.name },
      defaults: politicianData
    });
    
    if (!created) {
      // Update existing record
      await politicianRecord.update(politicianData);
    }
    
    // Format score data
    const scoreData = {
      politician_id: politicianRecord.id,
      total_score: scores.total_score,
      public_statements_score: scores.public_statements_score,
      legislative_action_score: scores.legislative_action_score,
      public_engagement_score: scores.public_engagement_score,
      social_media_score: scores.social_media_score,
      consistency_score: scores.consistency_score,
      days_of_silence: 0, // Not directly available in the data
      last_activity_date: new Date(), // Use current date as placeholder
      last_calculated: new Date()
    };
    
    // Create or update score record
    const [scoreRecord, scoreCreated] = await PoliticianScore.findOrCreate({
      where: { politician_id: politicianRecord.id },
      defaults: scoreData
    });
    
    if (!scoreCreated) {
      // Update existing record
      await scoreRecord.update(scoreData);
    }
    
    // Generate and import statements
    const statements = generateStatements(politician, politicianRecord.id);
    let statementCount = 0;
    
    for (const statementData of statements) {
      // Extract tags
      const tagNames = statementData.tags || [];
      delete statementData.tags;
      
      // Create statement
      const statement = await Statement.create(statementData);
      
      // Add tags
      if (tagNames.length > 0) {
        for (const tagName of tagNames) {
          // Find or create tag
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName }
          });
          
          // Associate tag with statement
          await statement.addTag(tag);
        }
      }
      
      statementCount++;
    }
    
    return {
      politician: politicianRecord,
      score: scoreRecord,
      statements: statementCount,
      created: created,
      scoreCreated: scoreCreated,
      leaderboard_category: scores.leaderboard_category
    };
  } catch (error) {
    console.error(`Error importing politician ${politician.basic_info.full_name}:`, error);
    throw error;
  }
}

/**
 * Main function to import Democratic senators data
 */
async function importDemocraticSenators() {
  try {
    console.log('Starting Democratic senators data import...');
    
    // Check if data file exists
    if (!fs.existsSync(DATA_FILE)) {
      console.error(`Error: Data file not found at ${DATA_FILE}`);
      return;
    }
    
    // Read the data file
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const politicians = JSON.parse(rawData);
    
    console.log(`Found ${politicians.length} politicians in the data.`);
    
    // Initialize database connection
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Import each politician
    const results = {
      total: politicians.length,
      processed: 0,
      failed: 0,
      failures: [],
      details: []
    };
    
    for (const politician of politicians) {
      try {
        // Check for data quality issues
        if (!politician.basic_info || !politician.basic_info.full_name) {
          console.error(`Missing basic info for politician with ID ${politician.member_id}`);
          continue;
        }
        
        if (!politician.positions_on_antidemocratic_principles) {
          console.error(`Missing positions data for ${politician.basic_info.full_name}`);
          continue;
        }
        
        // Import politician
        const result = await importPolitician(politician);
        
        results.processed++;
        results.details.push({
          name: politician.basic_info.full_name,
          scores: calculateScores(politician),
          statements: result.statements
        });
        
        console.log(`Imported ${politician.basic_info.full_name} with ${result.statements} statements`);
      } catch (error) {
        results.failed++;
        results.failures.push({
          name: politician.basic_info.full_name,
          error: error.message
        });
        console.error(`Failed to import ${politician.basic_info.full_name}:`, error.message);
      }
    }
    
    // Print summary
    console.log('\nImport Summary:');
    console.log(`Total politicians: ${results.total}`);
    console.log(`Successfully imported: ${results.processed}`);
    console.log(`Failed to import: ${results.failed}`);
    
    // Generate report
    const topPerformers = results.details.filter(r => r.scores.leaderboard_category === 'Top Performer');
    const personsOfInterest = results.details.filter(r => r.scores.leaderboard_category === 'Person of Interest');
    
    console.log(`\nTop Performers (${topPerformers.length}):`);
    topPerformers.forEach(p => console.log(`- ${p.name} (${p.scores.total_score} points)`));
    
    console.log(`\nPersons of Interest (${personsOfInterest.length}):`);
    personsOfInterest.forEach(p => console.log(`- ${p.name} (${p.scores.total_score} points)`));
    
    if (results.failures.length > 0) {
      console.log('\nFailures:');
      results.failures.forEach(f => console.log(`- ${f.name}: ${f.error}`));
    }
    
  } catch (error) {
    console.error('Error importing Democratic senators data:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importDemocraticSenators().catch(console.error);
}

module.exports = {
  importDemocraticSenators,
  calculateScores
};
