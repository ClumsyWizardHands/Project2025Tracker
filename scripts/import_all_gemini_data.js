/**
 * Import all Gemini data
 * 
 * This script runs all the Gemini data import scripts in sequence:
 * 1. Process raw Gemini data
 * 2. Import politicians
 * 3. Import statements
 */

// Dependencies
const { spawn } = require('child_process');
const path = require('path');

// Constants
const SCRIPTS_DIR = __dirname;

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

// Main function
async function importAllGeminiData() {
  try {
    console.log('Starting import of all Gemini data...');
    
    // 1. Process raw Gemini data
    const processScript = path.join(SCRIPTS_DIR, 'process_gemini_data.js');
    const rawDataPath = path.join(SCRIPTS_DIR, '../data/gemini_raw_data.json');
    await runScript(`${processScript} ${rawDataPath}`);
    
    // 2. Import politicians
    const importPoliticiansScript = path.join(SCRIPTS_DIR, 'import_gemini_data.js');
    await runScript(importPoliticiansScript);
    
    // 3. Import statements
    const importStatementsScript = path.join(SCRIPTS_DIR, 'import_gemini_statements.js');
    await runScript(importStatementsScript);
    
    console.log('\nAll Gemini data imported successfully!');
    console.log('\nSummary:');
    console.log('1. Processed raw Gemini data');
    console.log('2. Imported politicians');
    console.log('3. Imported statements');
    
  } catch (error) {
    console.error('Error importing all Gemini data:', error.message);
    process.exit(1);
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importAllGeminiData().catch(console.error);
}

module.exports = {
  importAllGeminiData
};
