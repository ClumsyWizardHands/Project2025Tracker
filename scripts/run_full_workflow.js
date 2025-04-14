/**
 * Run Full Workflow
 * 
 * This script runs the complete workflow:
 * 1. Process Gemini data
 * 2. Import data into the database
 * 3. Start the application
 * 
 * It's useful for setting up the application from scratch.
 */

// Dependencies
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Constants
const SCRIPTS_DIR = __dirname;
const IMPORT_ALL_SCRIPT = path.join(SCRIPTS_DIR, 'import_all_gemini_data.js');
const RUN_APP_SCRIPT = path.join(SCRIPTS_DIR, 'run_app.js');
const RAW_DATA_PATH = path.join(SCRIPTS_DIR, '../data/gemini_raw_data.json');

// Function to run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Running ${path.basename(scriptPath)} ===\n`);
    
    const process = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`\n=== ${path.basename(scriptPath)} completed successfully ===\n`);
        resolve();
      } else {
        console.error(`\n=== ${path.basename(scriptPath)} failed with code ${code} ===\n`);
        reject(new Error(`Script ${path.basename(scriptPath)} failed with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error(`\n=== Error executing ${path.basename(scriptPath)}: ${err.message} ===\n`);
      reject(err);
    });
  });
}

// Function to check if raw data exists
function checkRawDataExists() {
  if (!fs.existsSync(RAW_DATA_PATH)) {
    console.error(`\nError: Raw data file not found at ${RAW_DATA_PATH}`);
    console.error('Please ensure the Gemini raw data file exists before running this script.\n');
    return false;
  }
  return true;
}

// Main function
async function runFullWorkflow() {
  try {
    console.log('Starting full workflow...');
    
    // Check if raw data exists
    if (!checkRawDataExists()) {
      process.exit(1);
    }
    
    // 1. Import all Gemini data
    console.log('\nStep 1: Importing Gemini data...');
    await runScript(IMPORT_ALL_SCRIPT);
    
    // 2. Run the application
    console.log('\nStep 2: Starting the application...');
    await runScript(RUN_APP_SCRIPT);
    
  } catch (error) {
    console.error('Error running full workflow:', error.message);
    process.exit(1);
  }
}

// Run the full workflow if this script is executed directly
if (require.main === module) {
  runFullWorkflow().catch(console.error);
}

module.exports = {
  runFullWorkflow
};
