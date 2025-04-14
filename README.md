# Fight Against the Quiet Coup

A platform to track politicians' positions on Project 2025.

## Overview

"Fight Against the Quiet Coup" is an application that allows users to track and analyze politicians' positions, statements, and scores related to Project 2025. It features a React frontend with a clean, professional blue/gold design and a Node.js/Express backend with PostgreSQL database.

## Project Structure

```
Project2025Tracker/
├── frontend/             # React frontend application
│   ├── public/           # Static files
│   └── src/              # Source code
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── assets/       # Images fonts etc.
│       ├── utils/        # Utility functions
│       ├── services/     # API service calls
│       └── styles/       # CSS/SCSS files
│
├── backend/              # Node.js/Express backend
│   ├── src/              # Source code
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Utility functions
│   ├── config/           # Configuration files
│   └── scripts/          # Database scripts etc.
│
├── scripts/              # Data processing and import scripts
│   ├── process_gemini_data.js      # Process raw Gemini data
│   ├── import_gemini_data.js       # Import politicians from Gemini data
│   ├── import_gemini_statements.js # Import statements from Gemini data
│   └── import_all_gemini_data.js   # Run all Gemini data import scripts
│
├── data/                 # Data files
│   ├── gemini_raw_data.json        # Raw data from Gemini
│   ├── gemini_politicians.json     # Processed politician data
│   └── gemini_sql_commands.sql     # Generated SQL commands
│
└── docker/               # Docker configuration
    ├── frontend/         # Frontend Docker setup
    ├── backend/          # Backend Docker setup
    └── db/               # Database Docker setup
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/project2025tracker.git
   cd Project2025Tracker
   ```

2. Start the application using Docker:
   ```
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - PostgreSQL: localhost:5432

### Development

#### Frontend

```bash
cd frontend
npm install
npm start
```

#### Backend

```bash
cd backend
npm install
npm run dev
```

## Database Schema

The application uses PostgreSQL with the following core tables:

- **politicians**: Information about politicians
- **statements**: Statements made by politicians regarding Project 2025
- **scores**: Scores assigned to politicians based on their positions

## Features

- Track politicians' positions on Project 2025
- Record and analyze statements
- Score politicians based on their alignment with Project 2025
- Responsive design with blue/gold color scheme
- Data processing and import scripts for Gemini data
- Automated scoring system based on multiple criteria:
  - Public statements (0-30 points)
  - Legislative actions (0-25 points)
  - Public engagement (0-20 points)
  - Social media activity (0-15 points)
  - Consistency (0-10 points)

## Data Import Scripts

The project includes several scripts for processing and importing data from various sources:

### process_gemini_data.js

Processes raw data from Gemini about politicians' stances on antidemocratic principles:
```bash
cd Project2025Tracker
node scripts/process_gemini_data.js data/gemini_raw_data.json
```

This script:
- Parses the JSON data from Gemini
- Scores each politician based on our scoring system
- Categorizes politicians as "Top Performers" or "Persons of Interest"
- Generates SQL commands for database import
- Creates a summary report

### import_gemini_data.js

Imports the processed politician data into the database:
```bash
cd Project2025Tracker
node scripts/import_gemini_data.js
```

This script:
- Creates or updates politician records in the database
- Adds scores for each politician
- Generates placeholder bios and images when needed

### import_gemini_statements.js

Imports statements for each politician based on the Gemini data:
```bash
cd Project2025Tracker
node scripts/import_gemini_statements.js
```

This script:
- Generates statements based on the politician's data
- Creates statement records in the database
- Adds appropriate tags to each statement

### import_all_gemini_data.js

Runs all the Gemini data import scripts in sequence:
```bash
cd Project2025Tracker
node scripts/import_all_gemini_data.js
```

This script:
1. Processes raw Gemini data
2. Imports politicians
3. Imports statements

### import_democratic_senators.js

Imports data about Democratic senators' positions on antidemocratic principles:
```bash
cd Project2025Tracker
node scripts/import_democratic_senators.js
```

This script:
- Calculates scores based on a 100-point scoring system across 5 categories plus a recency bonus
- Categorizes senators as "Top Performers" or "Persons of Interest" based on their scores
- Imports statements with proper attribution and sources
- Generates a detailed summary report with score breakdowns and leaderboard placements

### run_backend.js

Starts the backend server with proper environment setup:
```bash
cd Project2025Tracker
node scripts/run_backend.js
```

This script:
- Checks if .env file exists and creates it from .env.example if needed
- Changes to the backend directory
- Starts the server using npm run dev
- Handles process termination gracefully

This is useful for testing data imports and API endpoints without having to manually set up the environment.

### run_frontend.js

Starts the frontend development server:
```bash
cd Project2025Tracker
node scripts/run_frontend.js
```

This script:
- Changes to the frontend directory
- Starts the React development server using npm start
- Handles process termination gracefully

This is useful for testing the frontend application without having to manually navigate to the frontend directory.

### run_app.js

Starts both the frontend and backend servers simultaneously:
```bash
cd Project2025Tracker
node scripts/run_app.js
```

This script:
- Starts the backend server using run_backend.js
- Waits for the backend to initialize
- Starts the frontend server using run_frontend.js
- Handles process termination gracefully for both servers

This is useful for testing the full application stack with a single command.

### run_full_workflow.js

Runs the complete workflow from data processing to application startup:
```bash
cd Project2025Tracker
node scripts/run_full_workflow.js
```

This script:
1. Checks if the raw Gemini data file exists
2. Imports all Gemini data (processing, importing politicians, importing statements)
3. Starts the full application (both frontend and backend)

This is useful for setting up the application from scratch with a single command.

## License

[MIT License](LICENSE)
