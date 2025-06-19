import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TammyBaldwinPanel from '../components/politicians/TammyBaldwinPanel';

const TammyBaldwinPage = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Button
          component={RouterLink}
          to="/politicians"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3 }}
        >
          Back to Politicians
        </Button>
        
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: '"Special Elite", "Courier New", monospace',
            color: '#ff9800',
            mb: 3
          }}
        >
          CASE FILE: TAMMY BALDWIN
        </Typography>
        
        <TammyBaldwinPanel />
      </Box>
    </Container>
  );
};

export default TammyBaldwinPage;
