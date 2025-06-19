import React from 'react';
import { Container, Typography, Box, Button, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import JuanVargasPanel from '../components/politicians/JuanVargasPanel';

/**
 * JuanVargasPage displays a detailed assessment of Juan Vargas
 * using the enhanced scoring methodology
 */
const JuanVargasPage = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/politicians"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Politicians
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            Juan Vargas
          </Typography>
        </Breadcrumbs>
        
        {/* Back button */}
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/politicians"
          sx={{ mb: 2 }}
        >
          Back to Politicians
        </Button>
        
        {/* Page title */}
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Enhanced Assessment: Juan Vargas
        </Typography>
        
        {/* Juan Vargas Panel */}
        <JuanVargasPanel />
        
        {/* Navigation buttons */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/resistance-level/Active Resistor"
          >
            View All Active Resistors
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
          >
            Return to Dashboard
          </Button>
        </Box>
        
        {/* Methodology note */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            About Our Enhanced Scoring Methodology
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our enhanced scoring system evaluates politicians' resistance to authoritarian policies like Project 2025 using a comprehensive methodology that prioritizes actions over words. Politicians are scored across five categories: Public Statements & Advocacy (30%), Legislative Action & Oversight (25%), Public & Community Engagement (20%), Social Media & Digital Outreach (15%), and Consistency & Deep Impact (10%). 
            
            The system also evaluates strategic integrity, infrastructure understanding, and performance vs. impact to provide a nuanced assessment of each politician's resistance efforts. Based on these metrics, politicians are classified into four resistance levels: Defender, Active Resistor, Inconsistent Advocate, or Complicit Enabler.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default JuanVargasPage;
