/**
 * Run Backend Server
 * 
 * This script starts the backend server with proper environment setup.
 * It's useful for testing data imports and API endpoints.
 */

// Dependencies
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Constants
const BACKEND_DIR = path.join(__dirname, '../backend');
const ENV_FILE = path.join(BACKEND_DIR, '.env');
const ENV_EXAMPLE_FILE = path.join(BACKEND_DIR, '.env.example');

// Function to check if .env file exists and create it if not
function ensureEnvFile() {
  if (!fs.existsSync(ENV_FILE) && fs.existsSync(ENV_EXAMPLE_FILE)) {
    console.log('Creating .env file from .env.example...');
    fs.copyFileSync(ENV_EXAMPLE_FILE, ENV_FILE);
    console.log('.env file created successfully.');
  }
}

// Function to run the backend server
function runBackendServer() {
  console.log('Starting backend server...');
  
  // Ensure we have an .env file
  ensureEnvFile();
  
  // Change to backend directory and run the server
  process.chdir(BACKEND_DIR);
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Backend server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  serverProcess.on('error', (err) => {
    console.error(`Error starting backend server: ${err.message}`);
    process.exit(1);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down backend server...');
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down backend server...');
    serverProcess.kill('SIGTERM');
  });
}

// Run the backend server if this script is executed directly
if (require.main === module) {
  runBackendServer();
}

module.exports = {
  runBackendServer
};
