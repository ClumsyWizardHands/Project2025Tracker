import React from 'react';
import { Container, Typography, Box, Paper, Grid, Link } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth="md">
      <Box my={4} className="file-folder">
        <Typography 
          variant="h3" 
          component="h1" 
          className="case-title typewriter-text"
          sx={{ 
            color: '#ff9800', 
            mb: 3,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          CASE BACKGROUND: PROJECT 2025
          <div className="typewriter-cursor"></div>
        </Typography>
        
        {/* Thumbtacks for decoration */}
        <div className="thumbtack" style={{ top: '15px', left: '20px' }}></div>
        <div className="thumbtack" style={{ top: '15px', right: '20px' }}></div>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            position: 'relative',
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              zIndex: -1,
            }
          }}
        >
          {/* Coffee stain decoration */}
          <div className="coffee-stain" style={{ top: '10px', right: '20px', opacity: 0.3 }}></div>
          
          <Typography 
            variant="h5" 
            gutterBottom
            className="typewriter-text"
            sx={{ 
              color: '#ff9800',
              borderBottom: '1px solid rgba(255, 152, 0, 0.3)',
              pb: 1,
              mb: 2,
            }}
          >
            <span className="highlight highlight-yellow">MISSION BRIEFING</span>
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph
            className="typewriter-text"
            sx={{ 
              color: '#f0f0f0',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.7,
            }}
          >
            <span className="highlight highlight-red">Project 2025</span> is a radical blueprint for dismantling democratic institutions and imposing 
            extremist policies that threaten civil liberties and social progress. Our investigation 
            <span className="highlight highlight-yellow"> exposes which politicians are actively opposing this threat—and which remain 
            suspiciously silent</span>. Make no mistake: in this fight, <span className="highlight highlight-red">silence equals complicity</span>. 
            Politicians who fail to denounce Project 2025 are enabling its dangerous agenda.
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph
            className="typewriter-text"
            sx={{ 
              color: '#f0f0f0',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.7,
            }}
          >
            Our scoring system ruthlessly tracks politicians' statements, votes, and actions, providing 
            citizens with irrefutable evidence of who's taking a stand and who's hiding in the shadows. 
            This isn't just information—it's <span className="highlight highlight-yellow">ammunition for accountability</span>. 
            Use our evidence to demand your representatives oppose Project 2025 publicly and unequivocally. 
            The time for political fence-sitting is over. <span className="highlight highlight-red">Democracy is under investigation</span>, 
            and we're naming names.
          </Typography>
        </Paper>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            position: 'relative',
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          }}
          className="classified-stamp"
        >
          <Typography 
            variant="h5" 
            gutterBottom
            className="typewriter-text"
            sx={{ 
              color: '#ff9800',
              borderBottom: '1px solid rgba(255, 152, 0, 0.3)',
              pb: 1,
              mb: 2,
            }}
          >
            <span className="highlight highlight-yellow">INVESTIGATION METHODOLOGY</span>
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(26, 42, 87, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  className="typewriter-text"
                  sx={{ 
                    color: '#ff9800',
                  }}
                >
                  <span className="evidence-tag">01</span> Data Collection
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  className="typewriter-text"
                  sx={{ 
                    color: '#f0f0f0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    lineHeight: 1.7,
                  }}
                >
                  We collect public statements from politicians through official channels, including 
                  congressional records, press releases, social media, interviews, and public appearances.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(26, 42, 87, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  className="typewriter-text"
                  sx={{ 
                    color: '#ff9800',
                  }}
                >
                  <span className="evidence-tag">02</span> Analysis
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  className="typewriter-text"
                  sx={{ 
                    color: '#f0f0f0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    lineHeight: 1.7,
                  }}
                >
                  Our team of investigators analyzes each statement to categorize it based on policy area, 
                  sentiment, and alignment with Project 2025 positions.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(26, 42, 87, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  className="typewriter-text"
                  sx={{ 
                    color: '#ff9800',
                  }}
                >
                  <span className="evidence-tag">03</span> Assessment
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  className="typewriter-text"
                  sx={{ 
                    color: '#f0f0f0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    lineHeight: 1.7,
                  }}
                >
                  We develop assessment reports based on politicians' statements and voting records to provide a 
                  quantitative measure of their positions on various issues.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(26, 42, 87, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  className="typewriter-text"
                  sx={{ 
                    color: '#ff9800',
                  }}
                >
                  <span className="evidence-tag">04</span> Verification
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  className="typewriter-text"
                  sx={{ 
                    color: '#f0f0f0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    lineHeight: 1.7,
                  }}
                >
                  All evidence is sourced and cited, allowing users to verify information independently. 
                  We are committed to accuracy and welcome feedback.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            position: 'relative',
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Paperclip decoration */}
          <div className="paperclip" style={{ top: '-20px', right: '20px' }}></div>
          
          <Typography 
            variant="h5" 
            gutterBottom
            className="typewriter-text"
            sx={{ 
              color: '#ff9800',
              borderBottom: '1px solid rgba(255, 152, 0, 0.3)',
              pb: 1,
              mb: 2,
            }}
          >
            <span className="highlight highlight-yellow">CONTACT SECURE CHANNEL</span>
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph
            className="typewriter-text"
            sx={{ 
              color: '#f0f0f0',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.7,
            }}
          >
            We value your intelligence and contributions. If you have evidence, corrections, or would like 
            to join our investigation, please establish contact through our secure channels.
          </Typography>
          
          <Typography 
            variant="body1"
            className="typewriter-text"
            sx={{ 
              color: '#f0f0f0',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              backgroundColor: 'rgba(26, 42, 87, 0.5)',
              p: 2,
              border: '1px solid rgba(255, 152, 0, 0.3)',
            }}
          >
            Secure Email: <Link 
              href="mailto:info@project2025tracker.org" 
              sx={{ 
                color: '#ff9800',
                textDecoration: 'none',
                borderBottom: '1px dashed #ff9800',
                '&:hover': {
                  color: '#ffb74d',
                  borderBottom: '1px solid #ffb74d',
                }
              }}
            >
              info@project2025tracker.org
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AboutPage;
