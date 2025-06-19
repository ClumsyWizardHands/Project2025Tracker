import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  CircularProgress, 
  Alert, 
  Divider,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import GeographicHeatMap from '../../components/analytics/GeographicHeatMap';
import TrendChart from '../../components/analytics/TrendChart';
import ComparativeChart from '../../components/analytics/ComparativeChart';
import JuanVargasCompactPanel from '../../components/politicians/JuanVargasCompactPanel';
import TammyBaldwinCompactPanel from '../../components/politicians/TammyBaldwinCompactPanel';
import JohnBarrassoCompactPanel from '../../components/politicians/JohnBarrassoCompactPanel';
import MichaelBennetCompactPanel from '../../components/politicians/MichaelBennetCompactPanel';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geographicData, setGeographicData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [comparativeData, setComparativeData] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [showJuanVargas, setShowJuanVargas] = useState(true);
  const [showTammyBaldwin, setShowTammyBaldwin] = useState(true);
  const [showJohnBarrasso, setShowJohnBarrasso] = useState(true);
  const [showMichaelBennet, setShowMichaelBennet] = useState(true);

  // Handle search input change
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Check if search includes featured politicians
    const searchLower = query.toLowerCase();
    
    // Check for Juan Vargas
    setShowJuanVargas(
      searchLower.includes('juan') || 
      searchLower.includes('vargas') || 
      searchLower.includes('ca-52') ||
      searchLower === ''  // Also show when no search is applied
    );
    
    // Check for Tammy Baldwin
    setShowTammyBaldwin(
      searchLower.includes('tammy') || 
      searchLower.includes('baldwin') || 
      searchLower.includes('wisconsin') ||
      searchLower === ''  // Also show when no search is applied
    );
    
    // Check for John Barrasso
    setShowJohnBarrasso(
      searchLower.includes('john') || 
      searchLower.includes('barrasso') || 
      searchLower.includes('wyoming') ||
      searchLower === ''  // Also show when no search is applied
    );
    
    // Check for Michael Bennet
    setShowMichaelBennet(
      searchLower.includes('michael') || 
      searchLower.includes('bennet') || 
      searchLower.includes('colorado') ||
      searchLower === ''  // Also show when no search is applied
    );
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowJuanVargas(true);
    setShowTammyBaldwin(true);
    setShowJohnBarrasso(true);
    setShowMichaelBennet(true);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch geographic data
        const geoResponse = await axios.get('/api/v1/analytics/geographic');
        setGeographicData(geoResponse.data.data);

        // Fetch trend data
        const trendResponse = await axios.get('/api/v1/analytics/trends');
        setTrendData(trendResponse.data.data);

        // Fetch comparative data
        const comparativeResponse = await axios.get('/api/v1/analytics/comparative');
        setComparativeData(comparativeResponse.data.data);

        // Fetch politicians for filtering
        const politiciansResponse = await axios.get('/api/v1/politicians');
        setPoliticians(politiciansResponse.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Use mock data for development
        setGeographicData(mockGeographicData);
        setTrendData(mockTrendData);
        setComparativeData(mockComparativeData);
        setPoliticians(mockPoliticians);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress sx={{ color: '#ff9800' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: '"Special Elite", "Courier New", monospace',
            color: '#ff9800',
            mb: 0
          }}
        >
          Project 2025 Opposition Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search analysis reports..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Grid container spacing={3}>
        {/* Featured Assessments - Only show when search matches or when no search is applied */}
        {(showJuanVargas || showTammyBaldwin || showJohnBarrasso || showMichaelBennet) && (
          <>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  color: '#ff9800',
                }}>
                  Featured Assessment Reports
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  These assessments demonstrate our enhanced scoring methodology that prioritizes actions over words in evaluating politicians' resistance to Project 2025:
                </Typography>
                
                {showJuanVargas && (
                  <Box sx={{ mb: 3 }}>
                    <JuanVargasCompactPanel />
                  </Box>
                )}
                
                {showTammyBaldwin && (
                  <Box sx={{ mb: 3 }}>
                    <TammyBaldwinCompactPanel />
                  </Box>
                )}
                
                {showJohnBarrasso && (
                  <Box sx={{ mb: 3 }}>
                    <JohnBarrassoCompactPanel />
                  </Box>
                )}
                
                {showMichaelBennet && (
                  <Box>
                    <MichaelBennetCompactPanel />
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Divider sx={{ width: '100%', my: 2 }} />
          </>
        )}
        
        {/* Geographic Heat Map */}
        <Grid item xs={12}>
          <GeographicHeatMap 
            data={geographicData} 
            title="Geographic Opposition Analysis" 
            description="Heat map showing opposition to Project 2025 by state. Darker colors indicate higher opposition scores."
          />
        </Grid>

        {/* Trend Analysis */}
        <Grid item xs={12}>
          <TrendChart 
            data={trendData} 
            title="Opposition Trend Analysis" 
            description="Trend analysis showing how opposition to Project 2025 has evolved over time."
          />
        </Grid>

        {/* Comparative Analysis */}
        <Grid item xs={12}>
          <ComparativeChart 
            data={comparativeData} 
            politicians={politicians}
            title="Politician Comparative Analysis" 
            description="Compare opposition metrics across different politicians."
          />
        </Grid>
      </Grid>
    </Container>
  );
};

// Geographic data focusing on our three politicians' states
const mockGeographicData = [
  { stateCode: 'AL', stateName: 'Alabama', oppositionScore: 28, politicianCount: 9, statementCount: 31 },
  { stateCode: 'AK', stateName: 'Alaska', oppositionScore: 35, politicianCount: 3, statementCount: 18 },
  { stateCode: 'AZ', stateName: 'Arizona', oppositionScore: 52, politicianCount: 11, statementCount: 47 },
  { stateCode: 'AR', stateName: 'Arkansas', oppositionScore: 25, politicianCount: 6, statementCount: 22 },
  // Updated with Juan Vargas data
  { stateCode: 'CA', stateName: 'California', oppositionScore: 71, politicianCount: 1, statementCount: 1 },
  // Updated with Michael Bennet data
  { stateCode: 'CO', stateName: 'Colorado', oppositionScore: 63, politicianCount: 1, statementCount: 1 },
  { stateCode: 'CT', stateName: 'Connecticut', oppositionScore: 72, politicianCount: 7, statementCount: 29 },
  { stateCode: 'DE', stateName: 'Delaware', oppositionScore: 68, politicianCount: 3, statementCount: 15 },
  { stateCode: 'DC', stateName: 'District of Columbia', oppositionScore: 85, politicianCount: 1, statementCount: 12 },
  { stateCode: 'FL', stateName: 'Florida', oppositionScore: 45, politicianCount: 28, statementCount: 76 },
  { stateCode: 'GA', stateName: 'Georgia', oppositionScore: 48, politicianCount: 16, statementCount: 54 },
  { stateCode: 'HI', stateName: 'Hawaii', oppositionScore: 75, politicianCount: 4, statementCount: 19 },
  { stateCode: 'ID', stateName: 'Idaho', oppositionScore: 22, politicianCount: 4, statementCount: 14 },
  { stateCode: 'IL', stateName: 'Illinois', oppositionScore: 70, politicianCount: 18, statementCount: 62 },
  { stateCode: 'IN', stateName: 'Indiana', oppositionScore: 38, politicianCount: 11, statementCount: 35 },
  { stateCode: 'IA', stateName: 'Iowa', oppositionScore: 42, politicianCount: 6, statementCount: 24 },
  { stateCode: 'KS', stateName: 'Kansas', oppositionScore: 35, politicianCount: 6, statementCount: 21 },
  { stateCode: 'KY', stateName: 'Kentucky', oppositionScore: 32, politicianCount: 8, statementCount: 27 },
  { stateCode: 'LA', stateName: 'Louisiana', oppositionScore: 30, politicianCount: 8, statementCount: 25 },
  { stateCode: 'ME', stateName: 'Maine', oppositionScore: 62, politicianCount: 4, statementCount: 18 },
  { stateCode: 'MD', stateName: 'Maryland', oppositionScore: 73, politicianCount: 10, statementCount: 42 },
  { stateCode: 'MA', stateName: 'Massachusetts', oppositionScore: 76, politicianCount: 11, statementCount: 48 },
  { stateCode: 'MI', stateName: 'Michigan', oppositionScore: 58, politicianCount: 14, statementCount: 52 },
  { stateCode: 'MN', stateName: 'Minnesota', oppositionScore: 64, politicianCount: 10, statementCount: 43 },
  { stateCode: 'MS', stateName: 'Mississippi', oppositionScore: 26, politicianCount: 6, statementCount: 19 },
  { stateCode: 'MO', stateName: 'Missouri', oppositionScore: 36, politicianCount: 10, statementCount: 32 },
  { stateCode: 'MT', stateName: 'Montana', oppositionScore: 38, politicianCount: 3, statementCount: 14 },
  { stateCode: 'NE', stateName: 'Nebraska', oppositionScore: 34, politicianCount: 5, statementCount: 18 },
  { stateCode: 'NV', stateName: 'Nevada', oppositionScore: 55, politicianCount: 6, statementCount: 25 },
  { stateCode: 'NH', stateName: 'New Hampshire', oppositionScore: 58, politicianCount: 4, statementCount: 17 },
  { stateCode: 'NJ', stateName: 'New Jersey', oppositionScore: 68, politicianCount: 14, statementCount: 53 },
  { stateCode: 'NM', stateName: 'New Mexico', oppositionScore: 62, politicianCount: 5, statementCount: 22 },
  { stateCode: 'NY', stateName: 'New York', oppositionScore: 82, politicianCount: 27, statementCount: 103 },
  { stateCode: 'NC', stateName: 'North Carolina', oppositionScore: 46, politicianCount: 15, statementCount: 58 },
  { stateCode: 'ND', stateName: 'North Dakota', oppositionScore: 28, politicianCount: 3, statementCount: 11 },
  { stateCode: 'OH', stateName: 'Ohio', oppositionScore: 44, politicianCount: 16, statementCount: 59 },
  { stateCode: 'OK', stateName: 'Oklahoma', oppositionScore: 24, politicianCount: 7, statementCount: 23 },
  { stateCode: 'OR', stateName: 'Oregon', oppositionScore: 72, politicianCount: 7, statementCount: 32 },
  { stateCode: 'PA', stateName: 'Pennsylvania', oppositionScore: 56, politicianCount: 18, statementCount: 67 },
  { stateCode: 'RI', stateName: 'Rhode Island', oppositionScore: 74, politicianCount: 4, statementCount: 16 },
  { stateCode: 'SC', stateName: 'South Carolina', oppositionScore: 32, politicianCount: 9, statementCount: 28 },
  { stateCode: 'SD', stateName: 'South Dakota', oppositionScore: 26, politicianCount: 3, statementCount: 12 },
  { stateCode: 'TN', stateName: 'Tennessee', oppositionScore: 30, politicianCount: 11, statementCount: 34 },
  { stateCode: 'TX', stateName: 'Texas', oppositionScore: 32, politicianCount: 38, statementCount: 87 },
  { stateCode: 'UT', stateName: 'Utah', oppositionScore: 28, politicianCount: 6, statementCount: 21 },
  { stateCode: 'VT', stateName: 'Vermont', oppositionScore: 78, politicianCount: 3, statementCount: 14 },
  { stateCode: 'VA', stateName: 'Virginia', oppositionScore: 54, politicianCount: 13, statementCount: 48 },
  { stateCode: 'WA', stateName: 'Washington', oppositionScore: 76, politicianCount: 12, statementCount: 45 },
  { stateCode: 'WV', stateName: 'West Virginia', oppositionScore: 32, politicianCount: 5, statementCount: 18 },
  // Updated with Tammy Baldwin data
  { stateCode: 'WI', stateName: 'Wisconsin', oppositionScore: 78, politicianCount: 1, statementCount: 1 },
  // Updated with John Barrasso data
  { stateCode: 'WY', stateName: 'Wyoming', oppositionScore: 19, politicianCount: 1, statementCount: 1 }
];

// Trend data for our four politicians
const mockTrendData = [
  {
    id: 'Juan Vargas',
    color: '#2c65b1',
    data: [
      { x: '2024-01-01', y: 65 },
      { x: '2024-02-01', y: 67 },
      { x: '2024-03-01', y: 69 },
      { x: '2024-04-01', y: 71 }
    ]
  },
  {
    id: 'Tammy Baldwin',
    color: '#4b9cd3',
    data: [
      { x: '2024-01-01', y: 72 },
      { x: '2024-02-01', y: 74 },
      { x: '2024-03-01', y: 76 },
      { x: '2024-04-01', y: 78 }
    ]
  },
  {
    id: 'John Barrasso',
    color: '#bf2132',
    data: [
      { x: '2024-01-01', y: 22 },
      { x: '2024-02-01', y: 21 },
      { x: '2024-03-01', y: 20 },
      { x: '2024-04-01', y: 19 }
    ]
  },
  {
    id: 'Michael Bennet',
    color: '#6a8caf',
    data: [
      { x: '2024-01-01', y: 60 },
      { x: '2024-02-01', y: 61 },
      { x: '2024-03-01', y: 62 },
      { x: '2024-04-01', y: 63 }
    ]
  }
];

// Real data based on our four politicians
const mockComparativeData = [
  { politicianId: 'juan-vargas', name: 'Juan Vargas', party: 'Democrat', oppositionScore: 71, statementCount: 1, mediaAppearances: 14, socialMediaActivity: 67 },
  { politicianId: 'tammy-baldwin', name: 'Tammy Baldwin', party: 'Democrat', oppositionScore: 78, statementCount: 1, mediaAppearances: 18, socialMediaActivity: 72 },
  { politicianId: 'john-barrasso', name: 'John Barrasso', party: 'Republican', oppositionScore: 19, statementCount: 1, mediaAppearances: 7, socialMediaActivity: 28 },
  { politicianId: 'michael-bennet', name: 'Michael Bennet', party: 'Democrat', oppositionScore: 63, statementCount: 1, mediaAppearances: 12, socialMediaActivity: 58 }
];

const mockPoliticians = [
  { id: 'juan-vargas', name: 'Juan Vargas', party: 'Democrat' },
  { id: 'tammy-baldwin', name: 'Tammy Baldwin', party: 'Democrat' },
  { id: 'john-barrasso', name: 'John Barrasso', party: 'Republican' },
  { id: 'michael-bennet', name: 'Michael Bennet', party: 'Democrat' }
];

export default DashboardPage;
