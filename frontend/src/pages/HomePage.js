import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import AssessmentIcon from '@mui/icons-material/Assessment';

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4} className="file-folder">
        {/* Case file header */}
        <Box 
          sx={{ 
            position: 'relative',
            py: 4,
            px: { xs: 2, md: 4 },
            mb: 4,
            overflow: 'hidden'
          }}
        >
          {/* Coffee stain decoration */}
          <div className="coffee-stain" style={{ top: '20px', right: '40px' }}></div>
          
          {/* Thumbtacks */}
          <div className="thumbtack" style={{ top: '15px', left: '20px' }}></div>
          <div className="thumbtack" style={{ top: '15px', right: '20px' }}></div>
          <div className="thumbtack" style={{ bottom: '15px', left: '20px' }}></div>
          <div className="thumbtack" style={{ bottom: '15px', right: '20px' }}></div>
          
          <Typography 
            variant="h1" 
            component="h1" 
            align="center" 
            className="case-title"
            sx={{ mb: 3, color: '#ffffff' }}
          >
            FIGHT AGAINST THE QUIET COUP
          </Typography>
          
          <Typography 
            variant="h5" 
            align="center" 
            gutterBottom
            className="typewriter-text"
            sx={{ mb: 4 }}
          >
            <span className="highlight highlight-yellow">CONFIDENTIAL:</span> Tracking Politicians' Positions on Project 2025
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center" 
            paragraph
            className="typewriter-text"
            sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}
          >
            This investigation aims to document and analyze the public statements and actions of politicians 
            regarding Project 2025. <span className="highlight highlight-red">All information contained herein 
            is strictly for authorized personnel only.</span> The evidence collected will help citizens make 
            informed decisions about their representatives.
          </Typography>
          
          <Box display="flex" justifyContent="center" gap={2} sx={{ mb: 2 }}>
            <Button
              component={RouterLink}
              to="/politicians"
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<SearchIcon />}
              sx={{ 
                fontFamily: '"Special Elite", "Courier New", monospace',
                letterSpacing: '0.05em',
              }}
            >
              PERSONS OF INTEREST
            </Button>
            
            <Button
              component={RouterLink}
              to="/about"
              variant="outlined"
              color="secondary"
              size="large"
              sx={{ 
                fontFamily: '"Special Elite", "Courier New", monospace',
                letterSpacing: '0.05em',
                color: '#ff9800',
                borderColor: '#ff9800',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  borderColor: '#ffb74d',
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                }
              }}
            >
              CASE BACKGROUND
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 4 }} />
        
        {/* Key Features Section */}
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom
          className="typewriter-text"
          sx={{ mb: 4 }}
        >
          INVESTIGATION METHODOLOGY
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Paperclip decoration */}
              <div className="paperclip" style={{ top: '-20px', right: '20px' }}></div>
              
              <Typography variant="h5" component="h3" gutterBottom className="typewriter-text">
                <span className="highlight highlight-yellow">EVIDENCE COLLECTION</span>
              </Typography>
              <Typography variant="body1" className="typewriter-text">
                We meticulously document every statement, vote, and action related to Project 2025. 
                Each piece of evidence is cataloged, timestamped, and cross-referenced with other findings.
                <span className="evidence-tag" style={{ display: 'block', mt: 2 }}>EXHIBIT A</span>
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%',
                position: 'relative',
                overflow: 'visible',
              }}
              className="classified-stamp"
            >
              <Typography variant="h5" component="h3" gutterBottom className="typewriter-text">
                <span className="highlight highlight-blue">PATTERN ANALYSIS</span>
              </Typography>
              <Typography variant="body1" className="typewriter-text">
                Our investigators analyze patterns in politicians' behaviors and statements, 
                identifying inconsistencies and correlations that might otherwise go unnoticed.
                <span className="evidence-tag" style={{ display: 'block', mt: 2 }}>EXHIBIT B</span>
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Coffee stain decoration */}
              <div className="coffee-stain" style={{ bottom: '10px', left: '10px' }}></div>
              
              <Typography variant="h5" component="h3" gutterBottom className="typewriter-text">
                <span className="highlight highlight-red">CASE PROFILES</span>
              </Typography>
              <Typography variant="body1" className="typewriter-text">
                Each politician has a detailed case file with their history, connections, and 
                a comprehensive assessment of their stance on Project 2025 issues.
                <span className="evidence-tag" style={{ display: 'block', mt: 2 }}>EXHIBIT C</span>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box textAlign="center" sx={{ mb: 6, position: 'relative' }}>
          {/* Tape decoration */}
          <div className="tape tape-top-left"></div>
          <div className="tape tape-top-right"></div>
          
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              display: 'inline-block', 
              maxWidth: '600px',
              position: 'relative',
            }}
          >
            <Typography variant="h5" className="typewriter-text" paragraph>
              <span className="status-indicator status-active"></span>
              CASE STATUS: <span className="highlight highlight-yellow">ACTIVE</span>
            </Typography>
            
            <Typography variant="body1" className="typewriter-text" paragraph>
              This investigation is ongoing. New evidence is being collected daily as politicians continue 
              to make statements and take actions related to Project 2025.
            </Typography>
            
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<FolderIcon />}
              sx={{ 
                mt: 2,
                fontFamily: '"Special Elite", "Courier New", monospace',
                letterSpacing: '0.05em',
              }}
            >
              JOIN THE INVESTIGATION
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
