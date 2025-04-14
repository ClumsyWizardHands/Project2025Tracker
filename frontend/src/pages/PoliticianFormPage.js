import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// List of US states for dropdown
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming', 'District of Columbia'
];

// Political parties
const POLITICAL_PARTIES = [
  'Democrat', 'Republican', 'Independent', 'Libertarian', 'Green', 'Other'
];

// Political positions
const POLITICAL_POSITIONS = [
  'President', 'Vice President', 'Senator', 'Representative', 'Governor', 
  'Lieutenant Governor', 'State Senator', 'State Representative', 'Mayor', 
  'City Council Member', 'County Commissioner', 'Judge', 'Attorney General',
  'Secretary of State', 'Treasurer', 'Other'
];

const PoliticianFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const isEditMode = !!id;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    state: '',
    position: '',
    bio: '',
    photo_url: '',
    website_url: '',
    twitter_handle: '',
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch politician data if in edit mode
  useEffect(() => {
    const fetchPolitician = async () => {
      if (!isEditMode) return;
      
      try {
        setFetchLoading(true);
        setError('');
        
        const response = await axios.get(`/api/v1/politicians/${id}`);
        
        if (response.data && response.data.data && response.data.data.politician) {
          const politician = response.data.data.politician;
          
          setFormData({
            name: politician.name || '',
            party: politician.party || '',
            state: politician.state || '',
            position: politician.position || '',
            bio: politician.bio || '',
            photo_url: politician.photo_url || '',
            website_url: politician.website_url || '',
            twitter_handle: politician.twitter_handle || '',
          });
        }
      } catch (err) {
        console.error('Error fetching politician:', err);
        setError('Failed to load politician data. Please try again later.');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchPolitician();
  }, [id, isEditMode]);
  
  // Check if user is authorized
  useEffect(() => {
    if (!isAdmin || !isAdmin()) {
      navigate('/unauthorized');
    }
  }, [isAdmin, navigate]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    
    // Clear general messages
    setError('');
    setSuccess('');
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.party) {
      newErrors.party = 'Party is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }
    
    if (formData.photo_url && !/^https?:\/\/.+/.test(formData.photo_url)) {
      newErrors.photo_url = 'Photo URL must be a valid URL starting with http:// or https://';
    }
    
    if (formData.website_url && !/^https?:\/\/.+/.test(formData.website_url)) {
      newErrors.website_url = 'Website URL must be a valid URL starting with http:// or https://';
    }
    
    if (formData.twitter_handle && formData.twitter_handle.startsWith('@')) {
      newErrors.twitter_handle = 'Twitter handle should not include the @ symbol';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      if (isEditMode) {
        // Update existing politician
        await axios.put(`/api/v1/politicians/${id}`, formData);
        setSuccess('Politician updated successfully');
      } else {
        // Create new politician
        const response = await axios.post('/api/v1/politicians', formData);
        
        if (response.data && response.data.data && response.data.data.politician) {
          const newId = response.data.data.politician.id;
          setSuccess('Politician created successfully');
          
          // Redirect to the new politician's page after a short delay
          setTimeout(() => {
            navigate(`/politicians/${newId}`);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error saving politician:', err);
      setError(err.response?.data?.error?.message || 'Failed to save politician. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box my={4}>
        {/* Back button */}
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(isEditMode ? `/politicians/${id}` : '/politicians')}
          sx={{ mb: 2 }}
        >
          {isEditMode ? 'Back to Politician' : 'Back to Politicians'}
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            {isEditMode ? 'Edit Politician' : 'Add Politician'}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={!!errors.party}>
                  <InputLabel id="party-label">Party</InputLabel>
                  <Select
                    labelId="party-label"
                    id="party"
                    name="party"
                    value={formData.party}
                    label="Party"
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {POLITICAL_PARTIES.map((party) => (
                      <MenuItem key={party} value={party}>
                        {party}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.party && (
                    <Typography variant="caption" color="error">
                      {errors.party}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={!!errors.state}>
                  <InputLabel id="state-label">State</InputLabel>
                  <Select
                    labelId="state-label"
                    id="state"
                    name="state"
                    value={formData.state}
                    label="State"
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {US_STATES.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.state && (
                    <Typography variant="caption" color="error">
                      {errors.state}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={!!errors.position}>
                  <InputLabel id="position-label">Position</InputLabel>
                  <Select
                    labelId="position-label"
                    id="position"
                    name="position"
                    value={formData.position}
                    label="Position"
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {POLITICAL_POSITIONS.map((position) => (
                      <MenuItem key={position} value={position}>
                        {position}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.position && (
                    <Typography variant="caption" color="error">
                      {errors.position}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="bio"
                  name="bio"
                  label="Biography"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  error={!!errors.bio}
                  helperText={errors.bio}
                  disabled={loading}
                />
              </Grid>
              
              {/* Additional Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="photo_url"
                  name="photo_url"
                  label="Photo URL"
                  value={formData.photo_url}
                  onChange={handleChange}
                  error={!!errors.photo_url}
                  helperText={errors.photo_url || 'URL to the politician\'s photo'}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="website_url"
                  name="website_url"
                  label="Website URL"
                  value={formData.website_url}
                  onChange={handleChange}
                  error={!!errors.website_url}
                  helperText={errors.website_url || 'Official website URL'}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="twitter_handle"
                  name="twitter_handle"
                  label="Twitter Handle"
                  value={formData.twitter_handle}
                  onChange={handleChange}
                  error={!!errors.twitter_handle}
                  helperText={errors.twitter_handle || 'Twitter handle without @ symbol'}
                  disabled={loading}
                  InputProps={{
                    startAdornment: formData.twitter_handle ? '@' : '',
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {isEditMode ? 'Update Politician' : 'Add Politician'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PoliticianFormPage;
