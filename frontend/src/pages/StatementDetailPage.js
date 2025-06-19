import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert, Button, Paper, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import JuanVargasCompactPanel from '../components/politicians/JuanVargasCompactPanel';

const StatementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/statements')}
          sx={{ mb: 2 }}
        >
          Back to Statements
        </Button>

        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Statement Details
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Statement Evidence
          </Typography>
          
          <Typography variant="body1" paragraph>
            "Project 2025 would be detrimental to essential programs like Medicaid and SNAP that millions of Americans rely on. I strongly oppose these harmful policies that would hurt the most vulnerable in our communities."
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Date: April 10, 2025
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Source: Press Conference
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Context:</strong> Rep. Vargas made this statement during a press conference addressing budget proposals that would impact social programs.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Verification Status:</strong> Verified
          </Typography>
        </Paper>
        
        <Typography variant="h5" component="h2" gutterBottom>
          Politician Assessment
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          This statement is part of the overall assessment of Rep. Juan Vargas's stance on Project 2025:
        </Typography>
        
        <JuanVargasCompactPanel />
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" component="h2" gutterBottom>
          Related Evidence
        </Typography>
        
        <Alert severity="info">
          Additional related statements and evidence will be displayed here as they are collected and verified.
        </Alert>
      </Box>
    </Container>
  );
};

export default StatementDetailPage;
