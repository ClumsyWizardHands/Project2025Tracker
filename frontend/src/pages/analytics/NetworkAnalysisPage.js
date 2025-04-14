import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import NetworkGraph from '../../components/analytics/NetworkGraph';

const NetworkAnalysisPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch network data
        const response = await axios.get('/api/v1/analytics/network');
        setNetworkData(response.data.data);
      } catch (err) {
        console.error('Error fetching network data:', err);
        setError('Failed to load network data. Please try again later.');
        
        // Use mock data for development
        setNetworkData(mockNetworkData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress sx={{ color: '#ff9800' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
        Politician Network Analysis
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <NetworkGraph 
            data={networkData} 
            title="Politician Relationship Network" 
            description="Interactive network visualization showing relationships between politicians based on voting patterns, funding sources, committee memberships, and statement similarities."
          />
        </Grid>
      </Grid>
    </Container>
  );
};

// Mock data for development
const mockNetworkData = {
  nodes: [
    { id: 'node1', size: 20, color: '#2c65b1', label: 'John Smith (D)' },
    { id: 'node2', size: 15, color: '#bf2132', label: 'Jane Doe (R)' },
    { id: 'node3', size: 25, color: '#2c65b1', label: 'Robert Johnson (D)' },
    { id: 'node4', size: 18, color: '#bf2132', label: 'Sarah Williams (R)' },
    { id: 'node5', size: 22, color: '#b5a642', label: 'Michael Brown (I)' },
    { id: 'node6', size: 16, color: '#2c65b1', label: 'Emily Davis (D)' },
    { id: 'node7', size: 14, color: '#bf2132', label: 'David Wilson (R)' },
    { id: 'node8', size: 19, color: '#2c65b1', label: 'Lisa Martinez (D)' },
    { id: 'node9', size: 17, color: '#bf2132', label: 'James Taylor (R)' },
    { id: 'node10', size: 21, color: '#2c65b1', label: 'Patricia Anderson (D)' }
  ],
  links: [
    { source: 'node1', target: 'node3', distance: 50, strength: 0.8, type: 'voting' },
    { source: 'node1', target: 'node6', distance: 70, strength: 0.6, type: 'voting' },
    { source: 'node1', target: 'node8', distance: 80, strength: 0.5, type: 'voting' },
    { source: 'node1', target: 'node10', distance: 60, strength: 0.7, type: 'voting' },
    { source: 'node2', target: 'node4', distance: 50, strength: 0.8, type: 'voting' },
    { source: 'node2', target: 'node7', distance: 70, strength: 0.6, type: 'voting' },
    { source: 'node2', target: 'node9', distance: 60, strength: 0.7, type: 'voting' },
    { source: 'node3', target: 'node6', distance: 80, strength: 0.5, type: 'voting' },
    { source: 'node3', target: 'node8', distance: 70, strength: 0.6, type: 'voting' },
    { source: 'node3', target: 'node10', distance: 50, strength: 0.8, type: 'voting' },
    { source: 'node4', target: 'node7', distance: 80, strength: 0.5, type: 'voting' },
    { source: 'node4', target: 'node9', distance: 70, strength: 0.6, type: 'voting' },
    { source: 'node5', target: 'node1', distance: 90, strength: 0.4, type: 'voting' },
    { source: 'node5', target: 'node3', distance: 100, strength: 0.3, type: 'voting' },
    { source: 'node5', target: 'node2', distance: 90, strength: 0.4, type: 'voting' },
    { source: 'node5', target: 'node4', distance: 100, strength: 0.3, type: 'voting' },
    
    { source: 'node1', target: 'node2', distance: 120, strength: 0.2, type: 'funding' },
    { source: 'node3', target: 'node4', distance: 120, strength: 0.2, type: 'funding' },
    { source: 'node5', target: 'node6', distance: 110, strength: 0.3, type: 'funding' },
    { source: 'node7', target: 'node8', distance: 120, strength: 0.2, type: 'funding' },
    { source: 'node9', target: 'node10', distance: 110, strength: 0.3, type: 'funding' },
    { source: 'node1', target: 'node7', distance: 130, strength: 0.1, type: 'funding' },
    { source: 'node3', target: 'node9', distance: 130, strength: 0.1, type: 'funding' },
    
    { source: 'node1', target: 'node4', distance: 100, strength: 0.3, type: 'committees' },
    { source: 'node2', target: 'node3', distance: 100, strength: 0.3, type: 'committees' },
    { source: 'node5', target: 'node8', distance: 90, strength: 0.4, type: 'committees' },
    { source: 'node6', target: 'node9', distance: 100, strength: 0.3, type: 'committees' },
    { source: 'node7', target: 'node10', distance: 90, strength: 0.4, type: 'committees' },
    
    { source: 'node1', target: 'node5', distance: 80, strength: 0.5, type: 'statements' },
    { source: 'node2', target: 'node6', distance: 80, strength: 0.5, type: 'statements' },
    { source: 'node3', target: 'node7', distance: 70, strength: 0.6, type: 'statements' },
    { source: 'node4', target: 'node8', distance: 80, strength: 0.5, type: 'statements' },
    { source: 'node5', target: 'node9', distance: 70, strength: 0.6, type: 'statements' },
    { source: 'node6', target: 'node10', distance: 80, strength: 0.5, type: 'statements' }
  ]
};

export default NetworkAnalysisPage;
