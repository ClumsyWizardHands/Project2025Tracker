import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <Container maxWidth="md">
      <Box my={4} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} display="flex" justifyContent="center">
              <LockIcon color="error" sx={{ fontSize: 80 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h4" component="h1" align="center" gutterBottom color="error">
                Access Denied
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body1" align="center" paragraph>
                You don't have permission to access this page.
              </Typography>
              
              {isAuthenticated && currentUser && (
                <Typography variant="body2" align="center" paragraph>
                  Your current role ({currentUser.role}) does not have the required permissions.
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} display="flex" justifyContent="center" gap={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
