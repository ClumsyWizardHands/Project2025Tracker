import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Alert,
  Snackbar,
  Grid,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ScoringActionForm component for submitting new scoring actions
 * 
 * @param {Object} props
 * @param {string} props.politicianId - UUID of the politician (optional)
 * @param {Function} props.onSubmitSuccess - Callback function after successful submission
 */
const ScoringActionForm = ({ politicianId, onSubmitSuccess }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [politicians, setPoliticians] = useState([]);
  const [formData, setFormData] = useState({
    politician_id: politicianId || '',
    action_type: '',
    action_date: new Date(),
    description: '',
    source_url: '',
    points: 10,
    category: '',
    sub_category: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch politicians if politicianId is not provided
  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const response = await axios.get('/api/v1/politicians?limit=100');
        setPoliticians(response.data.data.politicians);
      } catch (err) {
        console.error('Error fetching politicians:', err);
        setError('Failed to load politicians. Please try again later.');
      }
    };
    
    if (!politicianId) {
      fetchPoliticians();
    }
  }, [politicianId]);

  // Handle form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, action_date: date }));
    
    // Clear error for this field
    if (formErrors.action_date) {
      setFormErrors(prev => ({ ...prev, action_date: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.politician_id) {
      errors.politician_id = 'Politician is required';
    }
    
    if (!formData.action_type) {
      errors.action_type = 'Action type is required';
    }
    
    if (!formData.action_date) {
      errors.action_date = 'Date is required';
    }
    
    if (!formData.description) {
      errors.description = 'Description is required';
    }
    
    if (formData.source_url && !/^https?:\/\/.+/.test(formData.source_url)) {
      errors.source_url = 'Please enter a valid URL starting with http:// or https://';
    }
    
    if (!formData.points || formData.points < 1 || formData.points > 100) {
      errors.points = 'Points must be between 1 and 100';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('/api/v1/scoring/actions', formData);
      
      setSuccess(true);
      setLoading(false);
      
      // Reset form
      setFormData({
        politician_id: politicianId || '',
        action_type: '',
        action_date: new Date(),
        description: '',
        source_url: '',
        points: 10,
        category: '',
        sub_category: ''
      });
      
      // Call onSubmitSuccess callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.error('Error submitting action:', err);
      setError(err.response?.data?.error || 'Failed to submit action. Please try again later.');
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSuccess(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Submit New Evidence
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Submit evidence of a politician's stance on Project 2025. Your submission will be reviewed by our team before being added to the database.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {!politicianId && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.politician_id}>
                  <InputLabel>Politician</InputLabel>
                  <Select
                    name="politician_id"
                    value={formData.politician_id}
                    onChange={handleInputChange}
                    label="Politician"
                  >
                    {politicians.map(politician => (
                      <MenuItem key={politician.id} value={politician.id}>
                        {politician.name} ({politician.party}, {politician.state})
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.politician_id && (
                    <FormHelperText>{formErrors.politician_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.action_type}>
                <InputLabel>Action Type</InputLabel>
                <Select
                  name="action_type"
                  value={formData.action_type}
                  onChange={handleInputChange}
                  label="Action Type"
                >
                  <MenuItem value="statement">Public Statement</MenuItem>
                  <MenuItem value="vote">Vote</MenuItem>
                  <MenuItem value="sponsorship">Bill Sponsorship</MenuItem>
                  <MenuItem value="social_post">Social Media Post</MenuItem>
                  <MenuItem value="public_event">Public Event</MenuItem>
                  <MenuItem value="interview">Interview</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formErrors.action_type && (
                  <FormHelperText>{formErrors.action_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="action_date"
                label="Action Date (YYYY-MM-DD)"
                type="date"
                value={formData.action_date ? formData.action_date.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  handleDateChange(date);
                }}
                fullWidth
                error={!!formErrors.action_date}
                helperText={formErrors.action_date}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0],
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                error={!!formErrors.description}
                helperText={formErrors.description || 'Provide a detailed description of the action'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="source_url"
                label="Source URL"
                value={formData.source_url}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.source_url}
                helperText={formErrors.source_url || 'Link to the source of this information'}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  <MenuItem value="public_statements">Public Statements</MenuItem>
                  <MenuItem value="legislative_action">Legislative Action</MenuItem>
                  <MenuItem value="public_engagement">Public Engagement</MenuItem>
                  <MenuItem value="social_media">Social Media</MenuItem>
                  <MenuItem value="consistency">Consistency</MenuItem>
                </Select>
                {formErrors.category && (
                  <FormHelperText>{formErrors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="sub_category"
                label="Sub-category (Optional)"
                value={formData.sub_category}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="points"
                label="Points (1-100)"
                type="number"
                value={formData.points}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 1, max: 100 }}
                error={!!formErrors.points}
                helperText={formErrors.points}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !user}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Submitting...' : 'Submit Evidence'}
                </Button>
              </Box>
              
              {!user && (
                <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: 'right' }}>
                  You must be logged in to submit evidence
                </Typography>
              )}
            </Grid>
          </Grid>
        </form>
        
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            Evidence submitted successfully! It will be reviewed by our team.
          </Alert>
        </Snackbar>
      </Paper>
  );
};

export default ScoringActionForm;
