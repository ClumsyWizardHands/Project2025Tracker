# System Patterns

## Architecture Overview

The application follows a modern web architecture with clear separation of concerns:

```
Client (React) <--> API Server (Express) <--> Database (PostgreSQL)
```

### Frontend Architecture
- **Component-Based Structure**: Organized by feature and reusability
- **Context API**: For state management (AuthContext)
- **Routing**: React Router for navigation
- **Styling**: CSS with a consistent blue/gold theme

### Backend Architecture
- **MVC Pattern**: Controllers, Models, and Views (API responses)
- **Service Layer**: Business logic separated from controllers
- **Middleware**: For cross-cutting concerns like authentication
- **Repository Pattern**: Database access abstracted in models

### Data Flow
- RESTful API endpoints for CRUD operations
- JWT-based authentication
- Structured error handling and response formatting

### Data Ingestion and Processing
- **Multi-Source Ingestion**: Data is gathered from multiple sources to ensure accuracy and completeness.
  - **Primary Source**: Congress.gov API for structured member data.
  - **Secondary Sources**: Firecrawl, Perplexity, and Tavily are used for scraping and verifying data from reliable sources like Ballotpedia and GovTrack.
- **Data Reconciliation**: A dedicated script (`scripts/reconcile_member_data.js`) compares and verifies data from all sources to create a "golden record" of active members.
- **Data Import**: The vetted data is imported into the PostgreSQL database using a script that handles transformations and upserts.
- **Scoring**: A separate script (`scripts/score_politicians.js`) calculates and updates politician scores based on the latest data.
- **Soft Deletes**: An `is_active` flag is used to soft-delete former members, preserving their historical data while ensuring the application only displays active politicians.

## Recurring Design Patterns

### Frontend Patterns
1. **Container/Presentational Pattern**:
   - Container components handle data fetching and state
   - Presentational components focus on UI rendering

2. **Higher-Order Components**:
   - ProtectedRoute for authentication checks
   - WithLoading for loading states

3. **Custom Hooks**:
   - useAuth for authentication state
   - useFetch for API calls

4. **Component Structure**:
   ```
   components/
   ├── feature/                # Feature-specific components
   │   └── ComponentName.js    # Main component file
   ├── shared/                 # Shared/reusable components
   └── layout/                 # Layout components
   ```

### Backend Patterns
1. **Controller Pattern**:
   - Each resource has a dedicated controller
   - Controllers handle request/response but delegate business logic

2. **Service Layer**:
   - Complex business logic isolated in service classes
   - Services are injected into controllers

3. **Repository Pattern**:
   - Database operations encapsulated in model methods
   - Models represent database tables and relationships

4. **Middleware Chain**:
   - Authentication middleware
   - Error handling middleware
   - Request validation middleware

### Data Patterns
1. **Enhanced Scoring System**:
   - 100-point scale across 5 categories with specific weights (30/25/20/15/10)
   - Additional metrics for strategic integrity, infrastructure understanding, and performance vs. impact
   - Resistance level classification (Defender, Active Resistor, Inconsistent Advocate, Complicit Enabler)
   - Performance modifiers for performative actions (0.5x for social posts without follow-up, 0.3x for ceremonial engagements)
   - Time decay for older actions (100% for 0-30 days, 75% for 31-90 days, 50% for 91-180 days, 25% for 180+ days)
   - Recency bonus for recent activity (5 points for activity within 14 days)
   - Historical tracking of score changes
   - Contradiction detection between statements and actions

2. **Statement Classification**:
   - Statements tagged by topic and sentiment
   - Source attribution and verification with confidence ratings
   - Strategic value assessment (High/Medium/Low)
   - Action follow-up tracking
   - Impact assessment on overall score
   - Evidence quality tracking based on source type

3. **Committee Membership Tracking**:
   - Politicians' committee memberships and leadership positions
   - Used for infrastructure understanding assessment
   - Influences scoring based on position power utilization

## Known Constraints

### Technical Constraints
1. **Performance**:
   - Large datasets may impact frontend rendering performance
   - Complex scoring calculations might require optimization for response time
   - Caching strategy needed for frequently accessed politician assessments

2. **Browser Compatibility**:
   - Must support modern browsers (Chrome, Firefox, Safari, Edge)
   - Limited support for older browsers

3. **Mobile Responsiveness**:
   - Complex data visualizations must adapt to smaller screens
   - Touch interactions need special consideration

### Data Constraints
1. **Data Freshness**:
   - Political statements require timely updates
   - Score recalculation needed when new data is available
   - Days of silence tracking requires regular updates

2. **Data Completeness**:
   - Not all politicians may have comprehensive data
   - Some statements may lack complete context or sourcing
   - Committee membership data may be incomplete
   - Evidence sources need confidence ratings and proper attribution

3. **Objectivity**:
   - Enhanced scoring methodology must remain objective and consistent
   - Potential for perceived bias in strategic value and impact level assessments
   - Contradiction detection requires careful implementation to avoid false positives

### Security Constraints
1. **Authentication**:
   - JWT token expiration and refresh handling
   - Role-based access control for administrative functions

2. **Data Protection**:
   - User data must be protected according to privacy regulations
   - Admin actions should be logged for accountability

## Design Decisions

### Frontend Framework: React
- **Rationale**: Component reusability, virtual DOM efficiency, strong ecosystem
- **Alternatives Considered**: Vue.js, Angular
- **Trade-offs**: Learning curve, bundle size vs. development speed

### Backend Framework: Express
- **Rationale**: Lightweight, flexible, well-documented
- **Alternatives Considered**: Koa, Fastify, NestJS
- **Trade-offs**: Simplicity vs. built-in features

### Database: PostgreSQL
- **Rationale**: Relational data model fits political relationships, robust querying
- **Alternatives Considered**: MongoDB, MySQL
- **Trade-offs**: Schema rigidity vs. data integrity

### Authentication: JWT
- **Rationale**: Stateless, scalable, widely adopted
- **Alternatives Considered**: Session-based auth, OAuth
- **Trade-offs**: Token management complexity vs. scalability
