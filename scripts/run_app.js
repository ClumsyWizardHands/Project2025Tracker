/**
 * Run Full Application
 * 
 * This script starts both the frontend and backend servers simultaneously.
 * It's useful for testing the full application stack.
 */

// Dependencies
const { spawn } = require('child_process');
const path = require('path');

// Constants
const SCRIPTS_DIR = __dirname;
const BACKEND_SCRIPT = path.join(SCRIPTS_DIR, 'run_backend.js');
const FRONTEND_SCRIPT = path.join(SCRIPTS_DIR, 'run_frontend.js');

// Function to run a script in a separate process
function runScript(scriptPath, name) {
  console.log(`Starting ${name} server...`);
  
  const process = spawn('node', [scriptPath], {
    stdio: 'inherit',
    shell: true,
    detached: true
  });
  
  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`${name} server exited with code ${code}`);
    }
  });
  
  process.on('error', (err) => {
    console.error(`Error starting ${name} server: ${err.message}`);
  });
  
  return process;
}

// Function to run the full application
function runFullApplication() {
  console.log('Starting full application stack...');
  
  // Start backend server
  const backendProcess = runScript(BACKEND_SCRIPT, 'Backend');
  
  // Wait a moment before starting the frontend to allow the backend to initialize
  setTimeout(() => {
    // Start frontend server
    const frontendProcess = runScript(FRONTEND_SCRIPT, 'Frontend');
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down application...');
      
      // Kill child processes
      if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGINT');
      }
      
      if (frontendProcess && !frontendProcess.killed) {
        frontendProcess.kill('SIGINT');
      }
      
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('Shutting down application...');
      
      // Kill child processes
      if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGTERM');
      }
      
      if (frontendProcess && !frontendProcess.killed) {
        frontendProcess.kill('SIGTERM');
      }
      
      process.exit(0);
    });
    
    console.log('\nApplication is running!');
    console.log('- Frontend: http://localhost:3000');
    console.log('- Backend API: http://localhost:5000');
    console.log('\nPress Ctrl+C to stop all servers.\n');
  }, 3000); // Wait 3 seconds before starting frontend
}

// Run the full application if this script is executed directly
if (require.main === module) {
  runFullApplication();
}

module.exports = {
  runFullApplication
};
