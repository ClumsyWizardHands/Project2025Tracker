import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert, 
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import HelpIcon from '@mui/icons-material/Help';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// Helper function to get status color and icon
const getStatusDisplay = (score) => {
  if (!score && score !== 0) {
    return {
      color: 'info',
      icon: <HelpIcon />,
      label: 'INSUFFICIENT DATA',
      description: 'Not enough evidence has been collected to determine a position.'
    };
  }

  if (score >= 7) {
    return {
      color: 'success',
      icon: <ThumbUpIcon />,
      label: 'WHISTLEBLOWER',
      description: 'Actively opposing Project 2025 and raising awareness about its dangers.'
    };
  } else if (score >= 4) {
    return {
      color: 'warning',
      icon: null,
      label: 'UNDER SURVEILLANCE',
      description: 'Has made some statements against Project 2025, but not consistently.'
    };
  } else {
    return {
      color: 'error',
      icon: <WarningIcon />,
      label: 'PERSON OF INTEREST',
      description: 'Has shown support for Project 2025 or remained suspiciously silent.'
    };
  }
};

const ScoresPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [rankings, setRankings] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [personsOfInterest, setPersonsOfInterest] = useState([]);
  const [filters, setFilters] = useState({
    party: '',
    state: '',
    position: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    parties: ['Democrat', 'Republican', 'Independent'],
    states: ['Alabama', 'Alaska', 'Arizona', 'California', 'New York', 'Texas'],
    positions: ['Senator', 'Representative', 'Governor']
  });
  const [scoreCategories, setScoreCategories] = useState({
    'Public Statements': 'Measures explicit statements opposing Project 2025',
    'Voting Record': 'Evaluates votes against Project 2025-aligned legislation',
    'Social Media Activity': 'Analyzes social media posts related to Project 2025',
    'Sponsored Legislation': 'Tracks bills introduced to counter Project 2025 agenda'
  });

  // Fetch politician rankings
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Build query parameters
        const params = new URLSearchParams();
        if (filters.party) params.append('party', filters.party);
        if (filters.state) params.append('state', filters.state);
        if (filters.position) params.append('position', filters.position);
        params.append('limit', 50);
        
        // Fetch rankings
        const response = await axios.get(`/api/v1/scores/rankings?${params.toString()}`);
        
        if (response.data && response.data.data) {
          const allRankings = response.data.data;
          
          // Set all rankings
          setRankings(allRankings);
          
          // Set top performers (score >= 7)
          setTopPerformers(allRankings.filter(p => p.averageScore >= 7));
          
          // Set persons of interest (score < 4 or null)
          setPersonsOfInterest(allRankings.filter(p => p.averageScore === null || p.averageScore < 4));
        }
      } catch (err) {
        console.error('Error fetching politician rankings:', err);
        setError('Failed to load politician rankings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRankings();
  }, [filters]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      party: '',
      state: '',
      position: ''
    });
  };

  // Render score meter
  const renderScoreMeter = (score, label) => {
    const statusDisplay = getStatusDisplay(score);
    
    return (
      <Box sx={{ mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" fontWeight="bold" color={`${statusDisplay.color}.main`}>
            {score !== null ? score.toFixed(1) : 'N/A'}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={score !== null ? (score * 10) : 0}
          color={statusDisplay.color}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
    );
  };

  // Render politician card
  const renderPoliticianCard = (politician) => {
    const statusDisplay = getStatusDisplay(politician.averageScore);
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: 0,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'visible',
          backgroundColor: '#1e1e1e',
        }}
        className="file-folder"
      >
        {/* Case status */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            zIndex: 2,
            transform: 'rotate(-5deg)',
          }}
        >
          <Chip
            label={statusDisplay.label}
            color={statusDisplay.color}
            icon={statusDisplay.icon}
            sx={{ 
              fontFamily: '"Special Elite", "Courier New", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          />
        </Box>
        
        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
          <Typography 
            variant="h6" 
            component="div" 
            gutterBottom
            className="typewriter-text"
            sx={{ 
              color: '#ff9800',
              letterSpacing: '0.05em',
              position: 'relative',
            }}
          >
            <span className="highlight highlight-yellow">{politician.name}</span>
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              className="typewriter-text"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <span className="evidence-tag">PARTY</span>
              <Box component="span" sx={{ ml: 1 }}>
                {politician.party}
              </Box>
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              className="typewriter-text"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <span className="evidence-tag">STATE</span>
              <Box component="span" sx={{ ml: 1 }}>
                {politician.state}
              </Box>
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              className="typewriter-text"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <span className="evidence-tag">POSITION</span>
              <Box component="span" sx={{ ml: 1 }}>
                {politician.position}
              </Box>
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              className="typewriter-text"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span className="evidence-tag">DAYS SILENT</span>
              <Box 
                component="span" 
                sx={{ 
                  ml: 1,
                  color: politician.daysOfSilence > 14 ? 'error.main' : 'inherit'
                }}
              >
                {politician.daysOfSilence}
              </Box>
            </Typography>
          </Box>
          
          <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="body2" 
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              EVIDENCE METER
            </Typography>
            
            {renderScoreMeter(politician.averageScore, 'OVERALL SCORE')}
          </Box>
          
          <Button
            component={RouterLink}
            to={`/politicians/${politician.id}`}
            variant="contained"
            color="secondary"
            startIcon={<FolderOpenIcon />}
            fullWidth
            size="small"
            sx={{ 
              fontFamily: '"Special Elite", "Courier New", monospace',
              letterSpacing: '0.05em',
              mt: 'auto'
            }}
          >
            VIEW CASE FILE
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box my={4} className="file-folder">
        <Typography 
          variant="h3" 
          component="h1" 
          className="case-title typewriter-text"
          sx={{ 
            color: '#ff9800', 
            mb: 3,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          PROJECT 2025 ACCOUNTABILITY SCORES
          <div className="typewriter-cursor"></div>
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            position: 'relative',
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            className="typewriter-text"
            sx={{ 
              color: '#ff9800',
              borderBottom: '1px solid rgba(255, 152, 0, 0.3)',
              pb: 1,
              mb: 2,
            }}
          >
            <span className="highlight highlight-yellow">SCORING METHODOLOGY</span>
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph
            className="typewriter-text"
            sx={{ 
              color: '#f0f0f0',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.7,
            }}
          >
            Our scoring system ruthlessly tracks politicians' opposition to Project 2025 on a scale of 0-10, 
            with 10 representing the strongest opposition. Politicians are evaluated across multiple categories, 
            including public statements, voting records, social media activity, and sponsored legislation.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {Object.entries(scoreCategories).map(([category, description]) => (
              <Grid item xs={12} sm={6} key={category}>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(26, 42, 87, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    height: '100%',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    className="typewriter-text"
                    sx={{ 
                      color: '#ff9800',
                    }}
                  >
                    {category}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    className="typewriter-text"
                    sx={{ 
                      color: '#f0f0f0',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom
              className="typewriter-text"
              sx={{ 
                color: '#ff9800',
              }}
            >
              STATUS CLASSIFICATIONS
            </Typography>
            
            <Grid container spacing={2}>
              {[0, 4, 7, null].map((score) => {
                const status = getStatusDisplay(score);
                return (
                  <Grid item xs={12} sm={6} md={3} key={status.label}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: 'rgba(26, 42, 87, 0.3)',
                        border: `1px solid ${theme.palette[status.color].main}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Chip
                        label={status.label}
                        color={status.color}
                        icon={status.icon}
                        sx={{ mb: 1 }}
                      />
                      <Typography 
                        variant="body2" 
                        align="center"
                        className="typewriter-text"
                        sx={{ 
                          color: '#f0f0f0',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {status.description}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Paper>
        
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'relative',
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Filter controls */}
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 152, 0, 0.3)' }}>
            <Typography 
              variant="h5" 
              gutterBottom
              className="typewriter-text"
              sx={{ 
                color: '#ff9800',
                mb: 2,
              }}
            >
              <span className="highlight highlight-yellow">CONSPIRACY BOARD</span>
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="party-filter-label">Party</InputLabel>
                  <Select
                    labelId="party-filter-label"
                    id="party-filter"
                    name="party"
                    value={filters.party}
                    label="Party"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Parties</MenuItem>
                    {filterOptions.parties.map((party) => (
                      <MenuItem key={party} value={party}>
                        {party}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="state-filter-label">State</InputLabel>
                  <Select
                    labelId="state-filter-label"
                    id="state-filter"
                    name="state"
                    value={filters.state}
                    label="State"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All States</MenuItem>
                    {filterOptions.states.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="position-filter-label">Position</InputLabel>
                  <Select
                    labelId="position-filter-label"
                    id="position-filter"
                    name="position"
                    value={filters.position}
                    label="Position"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Positions</MenuItem>
                    {filterOptions.positions.map((position) => (
                      <MenuItem key={position} value={position}>
                        {position}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleClearFilters}
                  disabled={!filters.party && !filters.state && !filters.position}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              textColor="secondary"
              indicatorColor="secondary"
            >
              <Tab 
                icon={<ThumbUpIcon />} 
                label="Top Performers" 
                id="tab-0"
                aria-controls="tabpanel-0"
                sx={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  letterSpacing: '0.05em',
                }}
              />
              <Tab 
                icon={<WarningIcon />} 
                label="Persons of Interest" 
                id="tab-1"
                aria-controls="tabpanel-1"
                sx={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  letterSpacing: '0.05em',
                }}
              />
              <Tab 
                icon={<AssessmentIcon />} 
                label="All Politicians" 
                id="tab-2"
                aria-controls="tabpanel-2"
                sx={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  letterSpacing: '0.05em',
                }}
              />
            </Tabs>
          </Box>
          
          {/* Tab panels */}
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            ) : (
              <>
                {/* Top Performers */}
                <div
                  role="tabpanel"
                  hidden={tabValue !== 0}
                  id="tabpanel-0"
                  aria-labelledby="tab-0"
                >
                  {tabValue === 0 && (
                    <>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        className="typewriter-text"
                        sx={{ 
                          color: '#f0f0f0',
                          mb: 2,
                        }}
                      >
                        Politicians actively opposing Project 2025
                      </Typography>
                      
                      {topPerformers.length === 0 ? (
                        <Alert severity="info">
                          No politicians found with strong opposition to Project 2025 based on current filters.
                        </Alert>
                      ) : (
                        <Grid container spacing={3}>
                          {topPerformers.map((politician) => (
                            <Grid item xs={12} sm={6} md={4} key={politician.id}>
                              {renderPoliticianCard(politician)}
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </>
                  )}
                </div>
                
                {/* Persons of Interest */}
                <div
                  role="tabpanel"
                  hidden={tabValue !== 1}
                  id="tabpanel-1"
                  aria-labelledby="tab-1"
                >
                  {tabValue === 1 && (
                    <>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        className="typewriter-text"
                        sx={{ 
                          color: '#f0f0f0',
                          mb: 2,
                        }}
                      >
                        Politicians with minimal opposition to Project 2025
                      </Typography>
                      
                      {personsOfInterest.length === 0 ? (
                        <Alert severity="info">
                          No politicians found with minimal opposition to Project 2025 based on current filters.
                        </Alert>
                      ) : (
                        <Grid container spacing={3}>
                          {personsOfInterest.map((politician) => (
                            <Grid item xs={12} sm={6} md={4} key={politician.id}>
                              {renderPoliticianCard(politician)}
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </>
                  )}
                </div>
                
                {/* All Politicians */}
                <div
                  role="tabpanel"
                  hidden={tabValue !== 2}
                  id="tabpanel-2"
                  aria-labelledby="tab-2"
                >
                  {tabValue === 2 && (
                    <>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        className="typewriter-text"
                        sx={{ 
                          color: '#f0f0f0',
                          mb: 2,
                        }}
                      >
                        Complete ranking of politicians
                      </Typography>
                      
                      {rankings.length === 0 ? (
                        <Alert severity="info">
                          No politicians found based on current filters.
                        </Alert>
                      ) : (
                        <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(30, 30, 30, 0.7)' }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Politician</TableCell>
                                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Party</TableCell>
                                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>State</TableCell>
                                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Position</TableCell>
                                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Score</TableCell>
                                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Days Silent</TableCell>
                                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rankings.map((politician) => {
                                const statusDisplay = getStatusDisplay(politician.averageScore);
                                
                                return (
                                  <TableRow key={politician.id}>
                                    <TableCell>{politician.name}</TableCell>
                                    <TableCell>{politician.party}</TableCell>
                                    <TableCell>{politician.state}</TableCell>
                                    <TableCell>{politician.position}</TableCell>
                                    <TableCell>
                                      {politician.averageScore !== null ? politician.averageScore.toFixed(1) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={statusDisplay.label}
                                        color={statusDisplay.color}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        color={politician.daysOfSilence > 14 ? 'error' : 'inherit'}
                                      >
                                        {politician.daysOfSilence}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        component={RouterLink}
                                        to={`/politicians/${politician.id}`}
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                      >
                                        View
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ScoresPage;
