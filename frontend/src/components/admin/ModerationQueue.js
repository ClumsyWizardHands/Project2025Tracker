import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Chip,
  Divider,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import RepeatIcon from '@mui/icons-material/Repeat';
import EventIcon from '@mui/icons-material/Event';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * ModerationQueue component for admins to review and approve/reject scoring actions
 */
const ModerationQueue = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingActions, setPendingActions] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [dialogType, setDialogType] = useState('approve');
  const [rejectReason, setRejectReason] = useState('');

  // Fetch pending actions
  useEffect(() => {
    const fetchPendingActions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('/api/v1/scoring/actions/pending');
        setPendingActions(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pending actions:', err);
        setError('Failed to load pending actions. Please try again later.');
        setLoading(false);
      }
    };
    
    if (user && user.role === 'admin') {
      fetchPendingActions();
    }
  }, [user]);

  // Fetch recent actions
  useEffect(() => {
    const fetchRecentActions = async () => {
      try {
        const response = await axios.get('/api/v1/scoring/actions/recent');
        setRecentActions(response.data.data);
      } catch (err) {
        console.error('Error fetching recent actions:', err);
      }
    };
    
    fetchRecentActions();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  // Handle approve button click
  const handleApproveClick = (action) => {
    setDialogAction(action);
    setDialogType('approve');
    setOpenDialog(true);
  };

  // Handle reject button click
  const handleRejectClick = (action) => {
    setDialogAction(action);
    setDialogType('reject');
    setRejectReason('');
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setDialogAction(null);
  };

  // Handle approve action
  const handleApproveAction = async () => {
    try {
      await axios.put(`/api/v1/scoring/actions/${dialogAction.id}/verify`);
      
      // Remove from pending actions
      setPendingActions(prev => prev.filter(action => action.id !== dialogAction.id));
      
      // Add to recent actions
      const response = await axios.get('/api/v1/scoring/actions/recent');
      setRecentActions(response.data.data);
      
      setOpenDialog(false);
      setDialogAction(null);
    } catch (err) {
      console.error('Error approving action:', err);
      setError('Failed to approve action. Please try again later.');
    }
  };

  // Handle reject action
  const handleRejectAction = async () => {
    try {
      await axios.put(`/api/v1/scoring/actions/${dialogAction.id}/reject`, {
        reason: rejectReason
      });
      
      // Remove from pending actions
      setPendingActions(prev => prev.filter(action => action.id !== dialogAction.id));
      
      setOpenDialog(false);
      setDialogAction(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting action:', err);
      setError('Failed to reject action. Please try again later.');
    }
  };

  // If user is not admin, show unauthorized message
  if (user && user.role !== 'admin') {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        You do not have permission to access this page.
      </Alert>
    );
  }

  // If user is not logged in, show login message
  if (!user) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        Please log in to access this page.
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Moderation Queue
      </Typography>
      
      <Typography variant="body1" paragraph>
        Review and approve or reject submitted evidence about politicians' stances on Project 2025.
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="moderation tabs">
          <Tab label={`Pending (${pendingActions.length})`} id="tab-0" />
          <Tab label="Recently Approved" id="tab-1" />
        </Tabs>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box role="tabpanel" hidden={tabValue !== 0}>
          {tabValue === 0 && (
            pendingActions.length === 0 ? (
              <Alert severity="info" sx={{ my: 2 }}>
                No pending actions to review.
              </Alert>
            ) : (
              <List>
                {pendingActions.map((action) => (
                  <Paper key={action.id} sx={{ mb: 2 }}>
                    <ListItem>
                      <ListItemIcon>
                        {getCategoryIcon(action.category)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="span">
                              {formatActionType(action.action_type)}
                            </Typography>
                            <Chip 
                              label={formatCategoryName(action.category)}
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                            <Chip 
                              label={`+${action.points} points`}
                              size="small"
                              color="secondary"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <PersonIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                              <Typography variant="body2" component="span" color="text.secondary">
                                {action.politician?.name || 'Unknown Politician'}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                              {action.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                            
                            {action.creator && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Submitted by: {action.creator.username}
                                </Typography>
                              </Box>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="approve" 
                          onClick={() => handleApproveClick(action)}
                          color="success"
                          sx={{ mr: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="reject" 
                          onClick={() => handleRejectClick(action)}
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Paper>
                ))}
              </List>
            )
          )}
        </Box>
      )}
      
      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          recentActions.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              No recently approved actions.
            </Alert>
          ) : (
            <List>
              {recentActions.map((action) => (
                <Paper key={action.id} sx={{ mb: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      {getCategoryIcon(action.category)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="span">
                            {formatActionType(action.action_type)}
                          </Typography>
                          <Chip 
                            label={formatCategoryName(action.category)}
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                          <Chip 
                            label={`+${action.points} points`}
                            size="small"
                            color="secondary"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PersonIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" component="span" color="text.secondary">
                              {action.politician_name || 'Unknown Politician'}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                            {action.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                </Paper>
              ))}
            </List>
          )
        )}
      </Box>
      
      {/* Approve/Reject Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogType === 'approve' ? 'Approve Action' : 'Reject Action'}
        </DialogTitle>
        <DialogContent>
          {dialogAction && (
            <>
              <DialogContentText>
                {dialogType === 'approve' 
                  ? 'Are you sure you want to approve this action? This will add it to the politician\'s score calculation.'
                  : 'Are you sure you want to reject this action? This will remove it from the queue.'}
              </DialogContentText>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  {formatActionType(dialogAction.action_type)} by {dialogAction.politician?.name || 'Unknown Politician'}
                </Typography>
                <Typography variant="body2">
                  {dialogAction.description}
                </Typography>
              </Box>
              
              {dialogType === 'reject' && (
                <TextField
                  margin="dense"
                  label="Reason for rejection (optional)"
                  fullWidth
                  multiline
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={dialogType === 'approve' ? handleApproveAction : handleRejectAction} 
            color={dialogType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {dialogType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModerationQueue;
