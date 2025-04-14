import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import ScoringActionForm from '../components/scores/ScoringActionForm';

/**
 * SubmitEvidencePage allows users to submit evidence about politicians' stances on Project 2025
 */
const SubmitEvidencePage = () => {
  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            color: 'primary.main', 
            mb: 3,
            textAlign: 'center',
          }}
        >
          Submit Evidence
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: 'background.paper',
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
              color: 'primary.main',
              borderBottom: 1,
              borderColor: 'divider',
              pb: 1,
              mb: 2,
            }}
          >
            Citizen Contribution Protocol
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              color: 'text.primary',
              lineHeight: 1.7,
            }}
          >
            Your vigilance is crucial to our mission. Submit evidence of politicians' statements regarding 
            Project 2025 using this secure form. All submissions undergo verification by our research team 
            before being added to our database. You will be notified when your submission is approved.
          </Typography>
        </Paper>
        
        <ScoringActionForm />
      </Box>
    </Container>
  );
};

export default SubmitEvidencePage;
