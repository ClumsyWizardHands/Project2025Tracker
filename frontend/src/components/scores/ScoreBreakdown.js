import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import RepeatIcon from '@mui/icons-material/Repeat';
import EventIcon from '@mui/icons-material/Event';
import LinkIcon from '@mui/icons-material/Link';
import axios from 'axios';
import ScoreHistoryChart from './ScoreHistoryChart';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * ScoreBreakdown component displays detailed breakdown of a politician's score
 * 
 * @param {Object} props
 * @param {string} props.politicianId - UUID of the politician
 */
const ScoreBreakdown = ({ politicianId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [expanded, setExpanded] = useState('panel1');

  // Fetch score breakdown
  useEffect(() => {
    const fetchBreakdown = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/v1/scoring/politicians/${politicianId}/breakdown`);
        setBreakdown(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching score breakdown:', err);
        setError('Failed to load score breakdown. Please try again later.');
        setLoading(false);
      }
    };
    
    if (politicianId) {
      fetchBreakdown();
    }
  }, [politicianId]);

  // Handle accordion change
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'public_statements':
        return <RecordVoiceOverIcon />;
      case 'legislative_action':
        return <GavelIcon />;
      case 'public_engagement':
        return <PeopleIcon />;
      case 'social_media':
        return <ChatIcon />;
      case 'consistency':
        return <RepeatIcon />;
      default:
        return null;
    }
  };

  // Get color for score
  const getScoreColor = (score) => {
    if (score >= 80) {
      return theme.palette.success.main;
    } else if (score >= 50) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.error.main;
    }
  };

  // Format category name
  const formatCategoryName = (category) => {
    switch (category) {
      case 'public_statements':
        return 'Public Statements';
      case 'legislative_action':
        return 'Legislative Action';
      case 'public_engagement':
        return 'Public Engagement';
      case 'social_media':
        return 'Social Media';
      case 'consistency':
        return 'Consistency';
      default:
        return category;
    }
  };

  // Format action type
  const formatActionType = (type) => {
    switch (type) {
      case 'statement':
        return 'Statement';
      case 'vote':
        return 'Vote';
      case 'sponsorship':
        return 'Bill Sponsorship';
      case 'social_post':
        return 'Social Media Post';
      case 'public_event':
        return 'Public Event';
      case 'interview':
        return 'Interview';
      default:
        return type;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : !breakdown ? (
        <Alert severity="info" sx={{ my: 2 }}>No score breakdown available for this politician.</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ScoreHistoryChart 
                politicianId={politicianId} 
                days={90} 
                showCategories={true} 
              />
            </Grid>
            
            <Grid item xs={12}>
              <Accordion 
                expanded={expanded === 'panel1'} 
                onChange={handleAccordionChange('panel1')}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography variant="h6">Score Components</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {breakdown.components.map((component) => (
                      <Grid item xs={12} sm={6} md={4} key={component.category}>
                        <Paper sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ mr: 1 }}>
                              {getCategoryIcon(component.category)}
                            </Box>
                            <Typography variant="subtitle1">
                              {formatCategoryName(component.category)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box 
                              sx={{ 
                                width: '100%', 
                                height: 10, 
                                bgcolor: theme.palette.grey[300],
                                borderRadius: 5,
                                mr: 2,
                                position: 'relative',
                                overflow: 'hidden',
                              }}
                            >
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  height: '100%',
                                  width: `${component.score}%`,
                                  bgcolor: getScoreColor(component.score),
                                  borderRadius: 5,
                                }}
                              />
                            </Box>
                            <Typography variant="h6" sx={{ color: getScoreColor(component.score) }}>
                              {component.score}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            Weight: {Math.round(component.weight * 100)}%
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              <Accordion 
                expanded={expanded === 'panel2'} 
                onChange={handleAccordionChange('panel2')}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2-content"
                  id="panel2-header"
                >
                  <Typography variant="h6">Recent Actions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {breakdown.recentActions.length === 0 ? (
                    <Alert severity="info">No recent actions recorded.</Alert>
                  ) : (
                    <List>
                      {breakdown.recentActions.map((action) => (
                        <ListItem 
                          key={action.id}
                          sx={{ 
                            mb: 1, 
                            bgcolor: theme.palette.background.paper,
                            borderRadius: 1,
                            boxShadow: 1
                          }}
                        >
                          <ListItemIcon>
                            {getCategoryIcon(action.category)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1">
                                  {formatActionType(action.action_type)}
                                </Typography>
                                <Chip 
                                  label={`+${action.points} points`}
                                  size="small"
                                  color="primary"
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" display="block">
                                  {action.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <EventIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                    {formatDate(action.action_date)}
                                  </Typography>
                                  
                                  {action.source_url && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <LinkIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                                      <Typography 
                                        variant="caption" 
                                        color="primary"
                                        component="a"
                                        href={action.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Source
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ScoreBreakdown;
