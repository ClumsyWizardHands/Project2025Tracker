# Project 2025 Tracker Scripts

This directory contains various scripts for data processing, import, and application management.

## Quick Start

You can run these scripts using npm:

```bash
# Process Gemini data
npm run process-gemini

# Import politicians
npm run import-gemini-data

# Import statements
npm run import-gemini-statements

# Import all Gemini data
npm run import-all-gemini

# Run backend server
npm run run-backend

# Run frontend server
npm run run-frontend

# Run both servers
npm run run-app

# Run full workflow
npm run run-workflow
```

## Data Processing Scripts

### process_gemini_data.js

Processes raw data from Gemini about politicians' stances on antidemocratic principles.

```bash
node process_gemini_data.js ../data/gemini_raw_data.json
```

#### Features:
- Parses JSON data from Gemini
- Scores politicians based on multiple criteria:
  - Public statements (0-30 points)
  - Legislative actions (0-25 points)
  - Public engagement (0-20 points)
  - Social media activity (0-15 points)
  - Consistency (0-10 points)
- Categorizes politicians as "Top Performers" or "Persons of Interest"
- Generates SQL commands for database import
- Creates a summary report

#### Outputs:
- `../data/gemini_politicians.json`: Processed politician data
- `../data/gemini_sql_commands.sql`: SQL commands for database import
- `../data/gemini_summary_report.md`: Summary report of the processed data

## Data Import Scripts

### import_gemini_data.js

Imports the processed politician data into the database.

```bash
node import_gemini_data.js
```

#### Features:
- Creates or updates politician records in the database
- Adds scores for each politician
- Generates placeholder bios and images when needed

### import_gemini_statements.js

Imports statements for each politician based on the Gemini data.

```bash
node import_gemini_statements.js
```

#### Features:
- Generates statements based on the politician's data
- Creates statement records in the database
- Adds appropriate tags to each statement

### import_all_gemini_data.js

Runs all the Gemini data import scripts in sequence.

```bash
node import_all_gemini_data.js
```

#### Steps:
1. Processes raw Gemini data
2. Imports politicians
3. Imports statements

### import_democratic_senators.js

Imports data about Democratic senators' positions on antidemocratic principles.

```bash
node import_democratic_senators.js
```

#### Features:
- Calculates scores based on a 100-point scoring system:
  - Public statements (0-30 points)
  - Legislative action (0-25 points)
  - Public engagement (0-20 points)
  - Social media activity (0-15 points)
  - Consistency factor (0-10 points)
  - Recency bonus (0-5 points)
- Categorizes politicians as "Top Performers" or "Persons of Interest" based on scores
- Imports statements with proper attribution and sources
- Handles potential duplicates with upsert operations

## Application Management Scripts

### run_backend.js

Starts the backend server with proper environment setup.

```bash
node run_backend.js
```

#### Features:
- Checks if .env file exists and creates it from .env.example if needed
- Changes to the backend directory
- Starts the server using npm run dev
- Handles process termination gracefully

### run_frontend.js

Starts the frontend development server.

```bash
node run_frontend.js
```

#### Features:
- Changes to the frontend directory
- Starts the React development server using npm start
- Handles process termination gracefully

### run_app.js

Starts both the frontend and backend servers simultaneously.

```bash
node run_app.js
```

#### Features:
- Starts the backend server using run_backend.js
- Waits for the backend to initialize
- Starts the frontend server using run_frontend.js
- Handles process termination gracefully for both servers

### run_full_workflow.js

Runs the complete workflow from data processing to application startup.

```bash
node run_full_workflow.js
```

#### Steps:
1. Checks if the raw Gemini data file exists
2. Imports all Gemini data (processing, importing politicians, importing statements)
3. Starts the full application (both frontend and backend)

## Other Scripts

### research_project2025.js

Researches Project 2025 information and politicians' stances.

```bash
node research_project2025.js
```

### fetch_congress_members.js

Fetches information about members of Congress from external APIs.

```bash
node fetch_congress_members.js
```

### score_politicians.js

Scores politicians based on their stances on Project 2025.

```bash
node score_politicians.js
```

## Environment Variables

The scripts use environment variables defined in `.env` files. See `.env.example` for the required variables.

## Dependencies

The scripts depend on the following Node.js modules:
- fs (File System)
- path
- child_process
- sequelize (for database operations)

## Error Handling

All scripts include error handling to gracefully handle failures. Check the console output for error messages and stack traces.
