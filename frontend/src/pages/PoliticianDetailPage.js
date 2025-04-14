import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Rating,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Twitter as TwitterIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`politician-tabpanel-${index}`}
      aria-labelledby={`politician-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PoliticianDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAdmin, isResearcher } = useAuth();
  
  // State for politician data
  const [politician, setPolitician] = useState(null);
  const [statements, setStatements] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch politician data
  useEffect(() => {
    const fetchPolitician = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch politician details
        const politicianResponse = await axios.get(`/api/v1/politicians/${id}`);
        
        if (politicianResponse.data && politicianResponse.data.data) {
          setPolitician(politicianResponse.data.data.politician);
        }
        
        // Fetch politician statements
        const statementsResponse = await axios.get(`/api/v1/politicians/${id}/statements`);
        
        if (statementsResponse.data && statementsResponse.data.data) {
          setStatements(statementsResponse.data.data.statements);
        }
        
        // Fetch politician scores
        const scoresResponse = await axios.get(`/api/v1/politicians/${id}/scores`);
        
        if (scoresResponse.data && scoresResponse.data.data) {
          setScores(scoresResponse.data.data.scores);
        }
      } catch (err) {
        console.error('Error fetching politician details:', err);
        setError('Failed to load politician details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPolitician();
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Navigate to edit politician page
  const handleEditPolitician = () => {
    navigate(`/politicians/${id}/edit`);
  };
  
  // Handle delete politician
  const handleDeletePolitician = async () => {
    if (window.confirm('Are you sure you want to delete this politician? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/v1/politicians/${id}`);
        navigate('/politicians');
      } catch (err) {
        console.error('Error deleting politician:', err);
        setError('Failed to delete politician. Please try again later.');
      }
    }
  };
  
  // Get party color
  const getPartyColor = () => {
    if (!politician) return theme.palette.text.secondary;
    
    const party = politician.party.toLowerCase();
    
    if (party.includes('republican')) {
      return theme.palette.error.main;
    } else if (party.includes('democrat')) {
      return theme.palette.primary.main;
    } else if (party.includes('independent')) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.text.secondary;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Alert severity="error">{error}</Alert>
          <Box mt={2} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/politicians')}
            >
              Back to Politicians
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }
  
  if (!politician) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Alert severity="info">Politician not found.</Alert>
          <Box mt={2} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/politicians')}
            >
              Back to Politicians
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        {/* Back button */}
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/politicians')}
          sx={{ mb: 2 }}
        >
          Back to Politicians
        </Button>
        
        {/* Politician header */}
        <Paper sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative' }}>
            {/* Admin actions */}
            {isAdmin && isAdmin() && (
              <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
                <IconButton
                  color="primary"
                  onClick={handleEditPolitician}
                  sx={{ mr: 1, bgcolor: 'rgba(255, 255, 255, 0.8)' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={handleDeletePolitician}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            
            <Grid container>
              {/* Politician photo */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: { xs: 200, md: '100%' },
                    minHeight: { md: 300 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200',
                  }}
                >
                  {politician.photo_url ? (
                    <Box
                      component="img"
                      src={politician.photo_url}
                      alt={politician.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <PersonIcon sx={{ fontSize: 100, color: 'grey.400' }} />
                  )}
                </Box>
              </Grid>
              
              {/* Politician info */}
              <Grid item xs={12} md={8}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {politician.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={politician.party}
                      sx={{
                        bgcolor: getPartyColor(),
                        color: 'white',
                      }}
                    />
                    <Chip
                      label={politician.position}
                      variant="outlined"
                    />
                    <Chip
                      icon={<LocationIcon />}
                      label={politician.state}
                      variant="outlined"
                    />
                  </Box>
                  
                  {politician.bio && (
                    <Typography variant="body1" paragraph>
                      {politician.bio}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {politician.website_url && (
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<LanguageIcon />}
                        href={politician.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </Button>
                    )}
                    
                    {politician.twitter_handle && (
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<TwitterIcon />}
                        href={`https://twitter.com/${politician.twitter_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Twitter
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Statements" />
            <Tab label="Voting History" />
            <Tab label="Score Breakdown" />
          </Tabs>
          
          <Divider />
          
          {/* Statements tab */}
          <TabPanel value={tabValue} index={0}>
            {statements.length === 0 ? (
              <Alert severity="info">
                No statements found for this politician.
              </Alert>
            ) : (
              <List>
                {statements.map((statement) => (
                  <React.Fragment key={statement.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="subtitle1" component="div">
                              {statement.content.length > 200
                                ? `${statement.content.substring(0, 200)}...`
                                : statement.content}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={formatDate(statement.date)}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={statement.source_name}
                                size="small"
                                variant="outlined"
                              />
                              {statement.is_verified && (
                                <Chip
                                  label="Verified"
                                  size="small"
                                  color="success"
                                />
                              )}
                              {statement.tags && statement.tags.map((tag) => (
                                <Chip
                                  key={tag.id}
                                  label={tag.name}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Button
                            variant="text"
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/statements/${statement.id}`)}
                          >
                            View Details
                          </Button>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {isResearcher && isResearcher() && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/politicians/${id}/statements/add`)}
                >
                  Add Statement
                </Button>
              </Box>
            )}
          </TabPanel>
          
          {/* Voting History tab */}
          <TabPanel value={tabValue} index={1}>
            <Alert severity="info">
              Voting history feature coming soon.
            </Alert>
          </TabPanel>
          
          {/* Score Breakdown tab */}
          <TabPanel value={tabValue} index={2}>
            {scores.length === 0 ? (
              <Alert severity="info">
                No scores found for this politician.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {scores.map((score) => (
                  <Grid item xs={12} sm={6} md={4} key={score.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {score.category}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Rating
                            value={score.score / 2} // Convert 0-10 scale to 0-5 for Rating component
                            precision={0.5}
                            readOnly
                          />
                          <Typography variant="h5" sx={{ ml: 1 }}>
                            {score.score.toFixed(1)}/10
                          </Typography>
                        </Box>
                        
                        {score.methodology && (
                          <Typography variant="body2" color="text.secondary">
                            {score.methodology}
                          </Typography>
                        )}
                        
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Last updated: {formatDate(score.last_updated)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {isResearcher && isResearcher() && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/politicians/${id}/scores/add`)}
                >
                  Add Score
                </Button>
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default PoliticianDetailPage;
