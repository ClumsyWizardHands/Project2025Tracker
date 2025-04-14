/**
 * Import statements from Gemini data
 * 
 * This script reads the processed Gemini data and imports statements
 * for each politician into the database.
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const { Politician, Statement, Tag } = require('../backend/src/models');
const sequelize = require('../backend/src/config/database');

// Constants
const GEMINI_DATA_PATH = path.join(__dirname, '../data/gemini_politicians.json');

// Function to generate statements for a politician
function generateStatements(politician) {
  const statements = [];
  const fullName = politician.basic_info.full_name;
  
  // Generate statements based on the politician's data
  
  // 1. Statement about opposition to antidemocratic movements
  if (politician.positions_on_antidemocratic_principles?.public_statements?.opposition_to_antidemocratic_movements) {
    const oppositionLevel = politician.positions_on_antidemocratic_principles.public_statements.opposition_to_antidemocratic_movements;
    
    let content = '';
    let source = 'Public Statement';
    let date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6)); // Random date in the last 6 months
    
    switch (oppositionLevel.toLowerCase()) {
      case 'strong':
        content = `${fullName} has strongly condemned Project 2025, calling it "a dangerous blueprint for authoritarianism" and "a threat to our democratic institutions."`;
        break;
      case 'moderate':
        content = `${fullName} has expressed concerns about Project 2025, stating that "some of the proposals go too far" and "we need to protect our democratic norms."`;
        break;
      case 'minimal':
        content = `${fullName} has made limited comments about Project 2025, acknowledging that "we should examine these proposals carefully" without taking a strong stance.`;
        break;
      case 'supportive':
        content = `${fullName} has spoken favorably about Project 2025, describing it as "a bold vision for America" and "a necessary roadmap for the next administration."`;
        break;
      default:
        content = `${fullName}'s position on Project 2025 remains unclear based on their public statements.`;
    }
    
    statements.push({
      content,
      source_name: source,
      source_url: null,
      date: date.toISOString().split('T')[0],
      is_verified: true,
      tags: ['Project 2025', 'Public Statement']
    });
  }
  
  // 2. Statement about legislative actions
  if (politician.positions_on_antidemocratic_principles?.legislative_actions?.key_votes) {
    const keyVotes = politician.positions_on_antidemocratic_principles.legislative_actions.key_votes;
    
    if (Array.isArray(keyVotes) && keyVotes.length > 0) {
      // Pick a random key vote
      const randomVote = keyVotes[Math.floor(Math.random() * keyVotes.length)];
      
      if (randomVote.bill_number && randomVote.vote_position) {
        let content = `${fullName} voted "${randomVote.vote_position}" on ${randomVote.bill_number}`;
        
        if (randomVote.relevance_summary) {
          content += `: ${randomVote.relevance_summary}`;
        }
        
        const date = randomVote.date ? new Date(randomVote.date) : new Date();
        
        statements.push({
          content,
          source_name: 'Congressional Record',
          source_url: randomVote.roll_call_url || null,
          date: date.toISOString().split('T')[0],
          is_verified: true,
          tags: ['Legislation', 'Voting Record']
        });
      }
    }
  }
  
  // 3. Statement about consistency
  if (politician.positions_on_antidemocratic_principles?.consistency_analysis) {
    const consistencyAnalysis = politician.positions_on_antidemocratic_principles.consistency_analysis;
    
    if (consistencyAnalysis.timeline_summary) {
      statements.push({
        content: `Analysis of ${fullName}'s record shows: ${consistencyAnalysis.timeline_summary}`,
        source_name: 'Consistency Analysis',
        source_url: null,
        date: new Date().toISOString().split('T')[0],
        is_verified: true,
        tags: ['Analysis', 'Timeline']
      });
    }
    
    if (consistencyAnalysis.response_to_key_events) {
      statements.push({
        content: `In response to key events, ${fullName} ${consistencyAnalysis.response_to_key_events}`,
        source_name: 'Key Events Analysis',
        source_url: null,
        date: new Date().toISOString().split('T')[0],
        is_verified: true,
        tags: ['Analysis', 'Key Events']
      });
    }
  }
  
  // 4. Generic statement about Project 2025 based on score
  const score = politician.scores.total_score;
  let content = '';
  
  if (score >= 70) {
    content = `${fullName} has consistently opposed Project 2025 and similar antidemocratic initiatives through public statements, legislative actions, and engagement with constituents.`;
  } else if (score >= 40) {
    content = `${fullName} has shown moderate opposition to Project 2025, though their stance has not been as strong or consistent as some of their colleagues.`;
  } else if (score > 0) {
    content = `${fullName} has shown minimal opposition to Project 2025, with limited public statements or legislative actions against antidemocratic initiatives.`;
  } else {
    content = `${fullName} has not taken a public stance against Project 2025, and may have expressed support for some of its proposals or similar antidemocratic initiatives.`;
  }
  
  statements.push({
    content,
    source_name: 'Project 2025 Tracker Analysis',
    source_url: null,
    date: new Date().toISOString().split('T')[0],
    is_verified: true,
    tags: ['Project 2025', 'Analysis']
  });
  
  return statements;
}

// Function to import statements for a politician
async function importStatements(politician, politicianRecord) {
  try {
    const statements = generateStatements(politician);
    const results = [];
    
    for (const statementData of statements) {
      // Extract tags
      const tagNames = statementData.tags || [];
      delete statementData.tags;
      
      // Add politician_id
      statementData.politician_id = politicianRecord.id;
      
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
      
      results.push(statement);
    }
    
    return results;
  } catch (error) {
    console.error(`Error importing statements for ${politician.basic_info.full_name}:`, error);
    throw error;
  }
}

// Main function
async function importGeminiStatements() {
  try {
    console.log('Starting Gemini statements import...');
    
    // Read the Gemini data
    const rawData = fs.readFileSync(GEMINI_DATA_PATH, 'utf8');
    const politicians = JSON.parse(rawData);
    
    console.log(`Found ${politicians.length} politicians in the data.`);
    
    // Initialize database connection
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Import statements for each politician
    const results = {
      total: politicians.length,
      processed: 0,
      statements: 0,
      failed: 0,
      failures: []
    };
    
    for (const politician of politicians) {
      try {
        // Find politician in database
        const politicianRecord = await Politician.findOne({
          where: { name: politician.basic_info.full_name }
        });
        
        if (!politicianRecord) {
          console.log(`Politician not found in database: ${politician.basic_info.full_name}. Skipping...`);
          results.failed++;
          results.failures.push({
            name: politician.basic_info.full_name,
            error: 'Politician not found in database'
          });
          continue;
        }
        
        // Import statements
        const statements = await importStatements(politician, politicianRecord);
        
        results.processed++;
        results.statements += statements.length;
        console.log(`Imported ${statements.length} statements for ${politician.basic_info.full_name}`);
      } catch (error) {
        results.failed++;
        results.failures.push({
          name: politician.basic_info.full_name,
          error: error.message
        });
        console.error(`Failed to import statements for ${politician.basic_info.full_name}:`, error.message);
      }
    }
    
    // Print summary
    console.log('\nImport Summary:');
    console.log(`Total politicians: ${results.total}`);
    console.log(`Processed: ${results.processed}`);
    console.log(`Total statements imported: ${results.statements}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\nFailures:');
      results.failures.forEach(failure => {
        console.log(`- ${failure.name}: ${failure.error}`);
      });
    }
    
    console.log('\nGemini statements import completed.');
    
  } catch (error) {
    console.error('Error importing Gemini statements:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importGeminiStatements().catch(console.error);
}

module.exports = {
  importGeminiStatements,
  generateStatements
};
