/**
 * Run Frontend Server
 * 
 * This script starts the frontend development server.
 * It's useful for testing the frontend application.
 */

// Dependencies
const { spawn } = require('child_process');
const path = require('path');

// Constants
const FRONTEND_DIR = path.join(__dirname, '../frontend');

// Function to run the frontend server
function runFrontendServer() {
  console.log('Starting frontend server...');
  
  // Change to frontend directory and run the server
  process.chdir(FRONTEND_DIR);
  
  const serverProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Frontend server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  serverProcess.on('error', (err) => {
    console.error(`Error starting frontend server: ${err.message}`);
    process.exit(1);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down frontend server...');
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down frontend server...');
    serverProcess.kill('SIGTERM');
  });
}

// Run the frontend server if this script is executed directly
if (require.main === module) {
  runFrontendServer();
}

module.exports = {
  runFrontendServer
};
