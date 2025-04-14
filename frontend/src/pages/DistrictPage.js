import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  CircularProgress, 
  Alert,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PublicIcon from '@mui/icons-material/Public';
import EventIcon from '@mui/icons-material/Event';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShareIcon from '@mui/icons-material/Share';
import axios from 'axios';
import ShareableCard from '../components/sharing/ShareableCard';

const DistrictPage = () => {
  const { stateCode, districtNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [representatives, setRepresentatives] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch representatives for this district
        const repsResponse = await axios.get(`/api/v1/districts/${stateCode}/${districtNumber}/representatives`);
        setRepresentatives(repsResponse.data.data);

        // Fetch events for this district
        const eventsResponse = await axios.get(`/api/v1/districts/${stateCode}/${districtNumber}/events`);
        setEvents(eventsResponse.data.data);
      } catch (err) {
        console.error('Error fetching district data:', err);
        setError('Failed to load district data. Please try again later.');
        
        // Use mock data for development
        setRepresentatives(mockRepresentatives);
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stateCode, districtNumber]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredRepresentatives = representatives.filter(rep => 
    rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.party.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage(`${label} copied to clipboard!`);
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  const handleAddToCalendar = (event) => {
    // Format for Google Calendar
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const startDateStr = startDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(url, '_blank');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Get party color
  const getPartyColor = (party) => {
    switch (party) {
      case 'Republican':
        return '#bf2132';
      case 'Democrat':
        return '#2c65b1';
      default:
        return '#b5a642';
    }
  };

  // Get score color
  const getScoreColor = (value) => {
    if (value >= 70) return '#4caf50';
    if (value >= 40) return '#ff9800';
    return '#bf2132';
  };

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
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: '"Special Elite", "Courier New", monospace',
            color: '#ff9800',
            mb: 1
          }}
        >
          {stateCode}-{districtNumber} District Intelligence
        </Typography>
        <Typography variant="body1" sx={{ color: '#e0e0e0', mb: 2 }}>
          Track and contact your local representatives regarding Project 2025.
        </Typography>
        
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search representatives..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#ff9800' }} />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#e0e0e0',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 152, 0, 0.5)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff9800',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff9800',
              }
            }
          }}
          sx={{ mb: 3 }}
        />
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontFamily: '"Special Elite", "Courier New", monospace',
              color: '#ff9800',
              mb: 2
            }}
          >
            Your Representatives
          </Typography>
          
          {filteredRepresentatives.length === 0 ? (
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: '#1e1e1e',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '4px',
              }}
            >
              <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
                No representatives found matching your search.
              </Typography>
            </Paper>
          ) : (
            filteredRepresentatives.map((rep) => (
              <Paper 
                key={rep.id}
                sx={{ 
                  p: 3, 
                  mb: 3,
                  backgroundColor: '#1e1e1e',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: '4px',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      component="h3"
                      sx={{ 
                        fontFamily: '"Special Elite", "Courier New", monospace',
                        color: '#ff9800',
                        mb: 1
                      }}
                    >
                      {rep.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={rep.party} 
                        size="small"
                        sx={{
                          backgroundColor: `${getPartyColor(rep.party)}20`,
                          color: getPartyColor(rep.party),
                          border: `1px solid ${getPartyColor(rep.party)}`,
                          mr: 1
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                        {rep.position}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {rep.project2025Score && (
                    <Box 
                      sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#2a2a2a',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        border: `3px solid ${getScoreColor(rep.project2025Score.value)}`,
                        boxShadow: `0 0 10px ${getScoreColor(rep.project2025Score.value)}40`
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        component="div"
                        sx={{ 
                          fontWeight: 'bold',
                          color: getScoreColor(rep.project2025Score.value)
                        }}
                      >
                        {rep.project2025Score.value}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        component="div"
                        sx={{ 
                          fontSize: '0.5rem',
                          color: '#e0e0e0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        Opposition
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', mb: 2 }} />
                
                <List dense>
                  {rep.office && (
                    <ListItem>
                      <ListItemIcon sx={{ color: '#ff9800', minWidth: 36 }}>
                        <LocationOnIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rep.office}
                        primaryTypographyProps={{ sx: { color: '#e0e0e0' } }}
                      />
                      <Tooltip title="Copy address">
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleCopyToClipboard(rep.office, 'Address')}
                          sx={{ color: '#ff9800' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  )}
                  
                  {rep.phone && (
                    <ListItem>
                      <ListItemIcon sx={{ color: '#ff9800', minWidth: 36 }}>
                        <PhoneIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rep.phone}
                        primaryTypographyProps={{ sx: { color: '#e0e0e0' } }}
                      />
                      <Tooltip title="Copy phone number">
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleCopyToClipboard(rep.phone, 'Phone number')}
                          sx={{ color: '#ff9800' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  )}
                  
                  {rep.email && (
                    <ListItem>
                      <ListItemIcon sx={{ color: '#ff9800', minWidth: 36 }}>
                        <EmailIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rep.email}
                        primaryTypographyProps={{ sx: { color: '#e0e0e0' } }}
                      />
                      <Tooltip title="Copy email address">
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleCopyToClipboard(rep.email, 'Email address')}
                          sx={{ color: '#ff9800' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  )}
                  
                  {rep.website && (
                    <ListItem>
                      <ListItemIcon sx={{ color: '#ff9800', minWidth: 36 }}>
                        <PublicIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rep.website}
                        primaryTypographyProps={{ sx: { color: '#e0e0e0' } }}
                      />
                      <Tooltip title="Copy website URL">
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleCopyToClipboard(rep.website, 'Website URL')}
                          sx={{ color: '#ff9800' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  )}
                </List>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to={`/politicians/${rep.id}`}
                    size="small"
                    startIcon={<PersonIcon />}
                    sx={{ 
                      color: '#ff9800',
                      borderColor: 'rgba(255, 152, 0, 0.5)',
                      '&:hover': {
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      }
                    }}
                  >
                    View Profile
                  </Button>
                  
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EmailIcon />}
                    href={`mailto:${rep.email}`}
                    sx={{ 
                      backgroundColor: 'rgba(255, 152, 0, 0.2)',
                      color: '#ff9800',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.3)',
                      }
                    }}
                  >
                    Contact
                  </Button>
                </Box>
              </Paper>
            ))
          )}
          
          {/* Shareable Card Example */}
          {representatives.length > 0 && representatives[0].project2025Score && representatives[0].statements && representatives[0].statements.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  color: '#ff9800',
                  mb: 2
                }}
              >
                Shareable Content
              </Typography>
              
              <ShareableCard 
                politician={representatives[0]} 
                statement={representatives[0].statements[0]} 
                score={representatives[0].project2025Score} 
              />
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontFamily: '"Special Elite", "Courier New", monospace',
              color: '#ff9800',
              mb: 2
            }}
          >
            Upcoming Events
          </Typography>
          
          {events.length === 0 ? (
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: '#1e1e1e',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '4px',
              }}
            >
              <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
                No upcoming events found for this district.
              </Typography>
            </Paper>
          ) : (
            events.map((event) => (
              <Card 
                key={event.id}
                sx={{ 
                  mb: 2,
                  backgroundColor: '#1e1e1e',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: '4px',
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    component="h3"
                    sx={{ 
                      fontFamily: '"Special Elite", "Courier New", monospace',
                      color: '#ff9800',
                      mb: 1
                    }}
                  >
                    {event.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon sx={{ color: '#ff9800', mr: 1, fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                      {new Date(event.startDate).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {event.startTime && `, ${event.startTime}`}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationOnIcon sx={{ color: '#ff9800', mr: 1, fontSize: '1rem', mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                      {event.location}
                    </Typography>
                  </Box>
                  
                  {event.description && (
                    <Accordion 
                      sx={{ 
                        backgroundColor: 'transparent',
                        color: '#e0e0e0',
                        boxShadow: 'none',
                        '&:before': {
                          display: 'none',
                        },
                        '& .MuiAccordionSummary-root': {
                          minHeight: 'auto',
                          padding: 0,
                        },
                        '& .MuiAccordionSummary-content': {
                          margin: 0,
                        },
                        '& .MuiAccordionDetails-root': {
                          padding: '8px 0 0 0',
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#ff9800' }} />}
                        aria-controls={`event-${event.id}-content`}
                        id={`event-${event.id}-header`}
                        sx={{ p: 0 }}
                      >
                        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                          View Details
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ color: '#e0e0e0', whiteSpace: 'pre-line' }}>
                          {event.description}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => handleAddToCalendar(event)}
                    sx={{ 
                      color: '#ff9800',
                      borderColor: 'rgba(255, 152, 0, 0.5)',
                      '&:hover': {
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      }
                    }}
                  >
                    Add to Calendar
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    onClick={() => handleCopyToClipboard(`${event.title} - ${event.location} - ${new Date(event.startDate).toLocaleDateString()}`, 'Event details')}
                    sx={{ 
                      color: '#ff9800',
                      borderColor: 'rgba(255, 152, 0, 0.5)',
                      '&:hover': {
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      }
                    }}
                  >
                    Share
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            color: '#ff9800',
            border: '1px solid rgba(255, 152, 0, 0.5)',
            '& .MuiAlert-icon': {
              color: '#ff9800'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Mock data for development
const mockRepresentatives = [
  {
    id: 1,
    name: 'Jane Smith',
    party: 'Democrat',
    position: 'Representative',
    office: '123 Capitol Hill, Washington DC 20001',
    phone: '(202) 555-1234',
    email: 'jane.smith@house.gov',
    website: 'https://smith.house.gov',
    project2025Score: { value: 85 },
    statements: [
      {
        id: 1,
        content: 'Project 2025 represents a dangerous attempt to undermine our democratic institutions and roll back decades of progress.',
        date: '2024-03-15',
        source: 'Press Conference'
      }
    ]
  },
  {
    id: 2,
    name: 'John Doe',
    party: 'Republican',
    position: 'Senator',
    office: '456 Senate Building, Washington DC 20002',
    phone: '(202) 555-5678',
    email: 'john.doe@senate.gov',
    website: 'https://doe.senate.gov',
    project2025Score: { value: 25 },
    statements: [
      {
        id: 2,
        content: 'Project 2025 offers a roadmap for effective governance and necessary reforms to our federal agencies.',
        date: '2024-02-20',
        source: 'Interview'
      }
    ]
  },
  {
    id: 3,
    name: 'Alex Johnson',
    party: 'Independent',
    position: 'State Representative',
    office: '789 State Capitol, Springfield IL 62701',
    phone: '(217) 555-9012',
    email: 'alex.johnson@state.il.gov',
    website: 'https://johnson.il.gov',
    project2025Score: { value: 60 },
    statements: [
      {
        id: 3,
        content: 'While Project 2025 contains some reasonable proposals for government efficiency, many of its policies would harm vulnerable communities.',
        date: '2024-01-10',
        source: 'Town Hall'
      }
    ]
  }
];

const mockEvents = [
  {
    id: 1,
    title: 'Town Hall Meeting',
    startDate: '2025-05-15',
    endDate: '2025-05-15',
    startTime: '6:00 PM',
    endTime: '8:00 PM',
    location: 'Community Center, 123 Main St',
    description: 'Join Representative Jane Smith for a discussion on Project 2025 and its potential impacts on our community. Bring your questions and concerns.'
  },
  {
    id: 2,
    title: 'Protest Against Project 2025',
    startDate: '2025-05-20',
    endDate: '2025-05-20',
    startTime: '12:00 PM',
    endTime: '3:00 PM',
    location: 'City Hall Plaza',
    description: 'Join community activists in a peaceful demonstration against Project 2025 policies. Speakers will include local leaders and policy experts.'
  },
  {
    id: 3,
    title: 'Policy Workshop: Understanding Project 2025',
    startDate: '2025-06-05',
    endDate: '2025-06-05',
    startTime: '10:00 AM',
    endTime: '4:00 PM',
    location: 'Public Library, Conference Room A',
    description: 'A day-long workshop analyzing the key components of Project 2025 and developing community response strategies. Lunch will be provided.'
  }
];

export default DistrictPage;
