import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const { forgotPassword, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    setError('');
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send password reset email. Please try again.');
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box my={4} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom color="primary">
            Forgot Password
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                If an account exists with that email, we've sent password reset instructions.
              </Alert>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  color="primary"
                >
                  Return to Login
                </Button>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="body1" paragraph>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleChange}
                error={!!emailError}
                helperText={emailError}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
              </Button>
              
              <Box display="flex" justifyContent="center">
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to Login
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
