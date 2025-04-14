import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import ModerationQueue from '../components/admin/ModerationQueue';

/**
 * ModerationQueuePage displays the moderation queue for admins to review and approve/reject scoring actions
 */
const ModerationQueuePage = () => {
  return (
    <Container maxWidth="lg">
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
          Evidence Verification Queue
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
            Verification Protocol
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              color: 'text.primary',
              lineHeight: 1.7,
            }}
          >
            All user-submitted evidence must undergo rigorous verification before being added to our database. 
            Please verify the accuracy of each statement by checking the provided source. Approve only statements 
            that can be verified with certainty. Reject submissions that cannot be verified or contain inaccuracies, 
            providing a clear reason for rejection.
          </Typography>
        </Paper>
        
        <ModerationQueue />
      </Box>
    </Container>
  );
};

export default ModerationQueuePage;
