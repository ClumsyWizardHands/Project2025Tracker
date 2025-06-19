import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  Chip, 
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

// Styled components
const ScoreProgress = styled(LinearProgress)(({ theme, value }) => {
  let color;
  if (value >= 80) {
    color = theme.palette.success.main;
  } else if (value >= 50) {
    color = theme.palette.warning.main;
  } else {
    color = theme.palette.error.main;
  }
  
  return {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.palette.grey[300],
    '& .MuiLinearProgress-bar': {
      backgroundColor: color,
    },
  };
});

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color, icon;
  
  switch (status) {
    case 'WHISTLEBLOWER':
      color = theme.palette.success.main;
      icon = <NotificationsActiveIcon />;
      break;
    case 'UNDER SURVEILLANCE':
      color = theme.palette.warning.main;
      icon = <SecurityIcon />;
      break;
    default: // PERSON OF INTEREST
      color = theme.palette.error.main;
      icon = <WarningIcon />;
  }
  
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 'bold',
    '& .MuiChip-icon': {
      color: 'inherit',
    },
  };
});

const ResistanceLevelChip = styled(Chip)(({ theme, level }) => {
  let color;
  
  switch (level) {
    case 'Defender':
      color = theme.palette.success.main;
      break;
    case 'Active Resistor':
      color = theme.palette.info.main;
      break;
    case 'Inconsistent Advocate':
      color = theme.palette.warning.main;
      break;
    default: // Complicit Enabler
      color = theme.palette.error.main;
  }
  
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 'bold',
    marginLeft: theme.spacing(1),
  };
});

/**
 * EnhancedScoreBreakdown component displays detailed scoring information
 * using the enhanced scoring methodology
 * 
 * @param {Object} props
 * @param {string} props.politicianId - UUID of the politician
 */
const EnhancedScoreBreakdown = ({ politicianId }) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/enhanced-scoring/assessment/${politicianId}`);
        setAssessment(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError('Failed to load enhanced scoring data');
      } finally {
        setLoading(false);
      }
    };
    
    if (politicianId) {
      fetchAssessment();
    }
  }, [politicianId]);
  
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Loading enhanced scoring data...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" align="center" color="error" gutterBottom>
          {error}
        </Typography>
      </Box>
    );
  }
  
  if (!assessment) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          No enhanced scoring data available
        </Typography>
      </Box>
    );
  }
  
  const { 
    politician, 
    scoring_data, 
    temporal_data, 
    evaluation 
  } = assessment;
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div">
            Enhanced Assessment
          </Typography>
          <Box>
            <StatusChip 
              label={evaluation.status} 
              status={evaluation.status}
              icon={
                evaluation.status === 'WHISTLEBLOWER' ? <NotificationsActiveIcon /> :
                evaluation.status === 'UNDER SURVEILLANCE' ? <SecurityIcon /> :
                <WarningIcon />
              }
            />
            <ResistanceLevelChip 
              label={evaluation.resistance_level}
              level={evaluation.resistance_level}
            />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Overall Score */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Overall Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <ScoreProgress variant="determinate" value={scoring_data.total_score} />
            </Box>
            <Typography variant="h5" component="div">
              {scoring_data.total_score}/100
            </Typography>
          </Box>
        </Box>
        
        {/* Category Scores */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Category Scores
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Public Statements (30%)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <ScoreProgress variant="determinate" value={scoring_data.category_scores.public_statements} />
                </Box>
                <Typography variant="body2">
                  {scoring_data.category_scores.public_statements}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Legislative Action (25%)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <ScoreProgress variant="determinate" value={scoring_data.category_scores.legislative_action} />
                </Box>
                <Typography variant="body2">
                  {scoring_data.category_scores.legislative_action}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Public Engagement (20%)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <ScoreProgress variant="determinate" value={scoring_data.category_scores.public_engagement} />
                </Box>
                <Typography variant="body2">
                  {scoring_data.category_scores.public_engagement}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Social Media (15%)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <ScoreProgress variant="determinate" value={scoring_data.category_scores.social_media} />
                </Box>
                <Typography variant="body2">
                  {scoring_data.category_scores.social_media}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Consistency (10%)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <ScoreProgress variant="determinate" value={scoring_data.category_scores.consistency} />
                </Box>
                <Typography variant="body2">
                  {scoring_data.category_scores.consistency}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Enhanced Metrics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Enhanced Metrics
            <Tooltip title="These metrics provide deeper insight into the politician's resistance to Project 2025">
              <HelpOutlineIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
            </Tooltip>
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Strategic Integrity
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <ScoreProgress variant="determinate" value={scoring_data.enhanced_metrics.strategic_integrity} />
                  </Box>
                  <Typography variant="body2">
                    {scoring_data.enhanced_metrics.strategic_integrity}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Measures alignment between words and actions, with penalties for contradictions.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Infrastructure Understanding
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <ScoreProgress variant="determinate" value={scoring_data.enhanced_metrics.infrastructure_understanding} />
                  </Box>
                  <Typography variant="body2">
                    {scoring_data.enhanced_metrics.infrastructure_understanding}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Evaluates use of position power, committee influence, and procedural knowledge.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Performance vs. Impact
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <ScoreProgress variant="determinate" value={scoring_data.enhanced_metrics.performance_vs_impact} />
                  </Box>
                  <Typography variant="body2">
                    {scoring_data.enhanced_metrics.performance_vs_impact}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Compares high-visibility actions with actual impact, penalizing performative behavior.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Temporal Data */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Temporal Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color={temporal_data.days_of_silence > 30 ? "error" : "primary"}>
                  {temporal_data.days_of_silence}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days of Silence
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color={temporal_data.actions_last_14_days > 0 ? "success" : "text.secondary"}>
                  {temporal_data.actions_last_14_days}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Actions in Last 14 Days
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4">
                  {temporal_data.last_activity_date ? 
                    new Date(temporal_data.last_activity_date).toLocaleDateString() : 
                    'None'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Activity Date
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Committee Memberships */}
        {politician.committees && politician.committees.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Committee Memberships
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Committee</TableCell>
                      <TableCell>Leadership Position</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {politician.committees.map((committee, index) => (
                      <TableRow key={index}>
                        <TableCell>{committee.name}</TableCell>
                        <TableCell>{committee.leadership_position || 'Member'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
        
        {/* Recent Actions */}
        {evaluation.recent_actions && evaluation.recent_actions.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Recent Actions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Impact</TableCell>
                          <TableCell>Follow-up</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {evaluation.recent_actions.map((action) => (
                          <TableRow key={action.id}>
                            <TableCell>{new Date(action.date).toLocaleDateString()}</TableCell>
                            <TableCell>{action.category.replace('_', ' ')}</TableCell>
                            <TableCell>{action.description}</TableCell>
                            <TableCell>
                              {action.impact_level || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {action.has_action_follow_up ? 
                                <CheckCircleIcon color="success" /> : 
                                <ErrorIcon color="error" />}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        )}
        
        {/* Contradictions */}
        {evaluation.contradictions && evaluation.contradictions.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" color="error">
                    <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Contradictions Detected
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {evaluation.contradictions.map((contradiction) => (
                          <TableRow key={contradiction.id}>
                            <TableCell>{new Date(contradiction.date).toLocaleDateString()}</TableCell>
                            <TableCell>{contradiction.description}</TableCell>
                            <TableCell>{contradiction.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedScoreBreakdown;
