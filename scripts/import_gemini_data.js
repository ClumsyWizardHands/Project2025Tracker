/**
 * Import Gemini data into the database
 * 
 * This script reads the processed Gemini data and imports it into the database.
 * It creates politician records and their associated scores.
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const { Politician, PoliticianScore } = require('../backend/src/models');
const sequelize = require('../backend/src/config/database');

// Constants
const GEMINI_DATA_PATH = path.join(__dirname, '../data/gemini_politicians.json');
const CHAMBER_MAP = {
  'Senate': 'Senator',
  'House': 'Representative'
};

// Function to map party abbreviations to full names
function getFullPartyName(partyAbbr) {
  switch (partyAbbr) {
    case 'D':
      return 'Democrat';
    case 'R':
      return 'Republican';
    case 'I':
      return 'Independent';
    default:
      return partyAbbr;
  }
}

// Function to generate a placeholder bio based on politician data
function generatePlaceholderBio(politician) {
  const party = getFullPartyName(politician.basic_info.party);
  const chamber = CHAMBER_MAP[politician.basic_info.chamber] || politician.basic_info.chamber;
  const state = politician.basic_info.state;
  
  let bio = `${politician.basic_info.full_name} is a ${party} ${chamber} from ${state}.`;
  
  // Add information about their stance on Project 2025
  if (politician.scores.total_score >= 70) {
    bio += ` They have shown strong opposition to antidemocratic movements and Project 2025.`;
  } else if (politician.scores.total_score >= 40) {
    bio += ` They have shown moderate opposition to antidemocratic movements and Project 2025.`;
  } else if (politician.scores.total_score > 0) {
    bio += ` They have shown minimal opposition to antidemocratic movements and Project 2025.`;
  } else {
    bio += ` They have shown support for or have not opposed antidemocratic movements and Project 2025.`;
  }
  
  // Add information about their consistency
  if (politician.scores.consistency > 0) {
    bio += ` They have been consistent in their stance.`;
  } else {
    bio += ` Their stance has been inconsistent or unclear.`;
  }
  
  return bio;
}

// Function to get a placeholder photo URL
function getPlaceholderPhotoUrl(politician) {
  const name = politician.basic_info.full_name.replace(/\s+/g, '-').toLowerCase();
  return `https://via.placeholder.com/300x400?text=${name}`;
}

// Function to import a single politician
async function importPolitician(politician) {
  try {
    // Format politician data
    const politicianData = {
      name: politician.basic_info.full_name,
      party: getFullPartyName(politician.basic_info.party),
      state: politician.basic_info.state,
      position: CHAMBER_MAP[politician.basic_info.chamber] || politician.basic_info.chamber,
      bio: generatePlaceholderBio(politician),
      photo_url: politician.basic_info.photo_url || getPlaceholderPhotoUrl(politician),
      website_url: politician.basic_info.official_website || null,
      twitter_handle: null // Not available in the data
    };
    
    // Create or update politician
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
      total_score: politician.scores.total_score,
      public_statements_score: politician.scores.public_statements,
      legislative_action_score: politician.scores.legislative_action,
      public_engagement_score: politician.scores.public_engagement,
      social_media_score: politician.scores.social_media,
      consistency_score: politician.scores.consistency,
      days_of_silence: 0, // Not available in the data
      last_activity_date: new Date(), // Use current date as placeholder
      last_calculated: new Date()
    };
    
    // Create or update score
    const [scoreRecord, scoreCreated] = await PoliticianScore.findOrCreate({
      where: { politician_id: politicianRecord.id },
      defaults: scoreData
    });
    
    if (!scoreCreated) {
      // Update existing record
      await scoreRecord.update(scoreData);
    }
    
    return {
      politician: politicianRecord,
      score: scoreRecord,
      created: created,
      scoreCreated: scoreCreated
    };
  } catch (error) {
    console.error(`Error importing politician ${politician.basic_info.full_name}:`, error);
    throw error;
  }
}

// Main function
async function importGeminiData() {
  try {
    console.log('Starting Gemini data import...');
    
    // Read the Gemini data
    const rawData = fs.readFileSync(GEMINI_DATA_PATH, 'utf8');
    const politicians = JSON.parse(rawData);
    
    console.log(`Found ${politicians.length} politicians in the data.`);
    
    // Initialize database connection
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Import each politician
    const results = {
      total: politicians.length,
      created: 0,
      updated: 0,
      failed: 0,
      failures: []
    };
    
    for (const politician of politicians) {
      try {
        const result = await importPolitician(politician);
        
        if (result.created) {
          results.created++;
          console.log(`Created politician: ${politician.basic_info.full_name}`);
        } else {
          results.updated++;
          console.log(`Updated politician: ${politician.basic_info.full_name}`);
        }
      } catch (error) {
        results.failed++;
        results.failures.push({
          name: politician.basic_info.full_name,
          error: error.message
        });
        console.error(`Failed to import politician ${politician.basic_info.full_name}:`, error.message);
      }
    }
    
    // Print summary
    console.log('\nImport Summary:');
    console.log(`Total politicians: ${results.total}`);
    console.log(`Created: ${results.created}`);
    console.log(`Updated: ${results.updated}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\nFailures:');
      results.failures.forEach(failure => {
        console.log(`- ${failure.name}: ${failure.error}`);
      });
    }
    
    console.log('\nGemini data import completed.');
    
  } catch (error) {
    console.error('Error importing Gemini data:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importGeminiData().catch(console.error);
}

module.exports = {
  importGeminiData,
  importPolitician
};
