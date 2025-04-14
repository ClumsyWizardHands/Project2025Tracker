import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, logout, loading, error: authError } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
      });
    }
  }, [currentUser]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Clear messages when switching tabs
    setError('');
    setSuccess('');
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
    
    // Clear field-specific error when user types
    if (profileErrors[name]) {
      setProfileErrors({
        ...profileErrors,
        [name]: '',
      });
    }
    
    // Clear messages
    setError('');
    setSuccess('');
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    
    // Clear field-specific error when user types
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: '',
      });
    }
    
    // Clear messages
    setError('');
    setSuccess('');
  };
  
  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.username) {
      newErrors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!profileData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      await updateProfile(profileData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile. Please try again.');
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      await updateProfile({
        password: passwordData.newPassword,
        current_password: passwordData.currentPassword,
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSuccess('Password updated successfully');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update password. Please try again.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  if (!currentUser) {
    return (
      <Container maxWidth="sm">
        <Box my={4} display="flex" flexDirection="column" alignItems="center">
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography variant="h5" align="center">
              You must be logged in to view this page
            </Typography>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Paper elevation={3}>
          <Box p={2}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              My Profile
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Manage your account settings and preferences
            </Typography>
          </Box>
          
          <Divider />
          
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Profile Information" />
            <Tab label="Change Password" />
          </Tabs>
          
          {(error || authError) && (
            <Box px={3} pt={3}>
              <Alert severity="error">
                {error || authError}
              </Alert>
            </Box>
          )}
          
          {success && (
            <Box px={3} pt={3}>
              <Alert severity="success">
                {success}
              </Alert>
            </Box>
          )}
          
          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleProfileSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="first_name"
                    label="First Name"
                    name="first_name"
                    autoComplete="given-name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    error={!!profileErrors.first_name}
                    helperText={profileErrors.first_name}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="last_name"
                    label="Last Name"
                    name="last_name"
                    autoComplete="family-name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    error={!!profileErrors.last_name}
                    helperText={profileErrors.last_name}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    error={!!profileErrors.username}
                    helperText={profileErrors.username}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    error={!!profileErrors.email}
                    helperText={profileErrors.email}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
              
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Logout
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                id="currentPassword"
                autoComplete="current-password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                autoComplete="new-password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                disabled={loading}
              />
              
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Password'}
                </Button>
              </Box>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;
