/**
 * Apply Enhanced Scoring Schema
 * 
 * This script applies the enhanced scoring schema to the database.
 * It runs the SQL commands in the enhanced-scoring-schema.sql file.
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

// Constants
const SCHEMA_FILE = path.join(__dirname, '..', 'backend', 'scripts', 'enhanced-scoring-schema.sql');

// Database connection config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'project2025tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

/**
 * Apply the enhanced scoring schema to the database
 */
async function applyEnhancedScoringSchema() {
  console.log('Applying enhanced scoring schema...');
  
  // Check if schema file exists
  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error(`Schema file not found: ${SCHEMA_FILE}`);
    process.exit(1);
  }
  
  // Read schema file
  const schemaSQL = fs.readFileSync(SCHEMA_FILE, 'utf8');
  
  // Connect to database
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Execute schema SQL
    console.log('Executing schema SQL...');
    await client.query(schemaSQL);
    
    console.log('Enhanced scoring schema applied successfully');
  } catch (error) {
    console.error('Error applying enhanced scoring schema:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
applyEnhancedScoringSchema();
