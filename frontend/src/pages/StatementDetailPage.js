import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
        
        <Alert severity="info">
          This feature is coming soon. The statement detail page will show detailed information about statement ID: {id}.
        </Alert>
      </Box>
    </Container>
  );
};

export default StatementDetailPage;
