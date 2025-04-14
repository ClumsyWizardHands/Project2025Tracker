import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import GeographicHeatMap from '../../components/analytics/GeographicHeatMap';
import TrendChart from '../../components/analytics/TrendChart';
import ComparativeChart from '../../components/analytics/ComparativeChart';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geographicData, setGeographicData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [comparativeData, setComparativeData] = useState([]);
  const [politicians, setPoliticians] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch geographic data
        const geoResponse = await axios.get('/api/v1/analytics/geographic');
        setGeographicData(geoResponse.data.data);

        // Fetch trend data
        const trendResponse = await axios.get('/api/v1/analytics/trends');
        setTrendData(trendResponse.data.data);

        // Fetch comparative data
        const comparativeResponse = await axios.get('/api/v1/analytics/comparative');
        setComparativeData(comparativeResponse.data.data);

        // Fetch politicians for filtering
        const politiciansResponse = await axios.get('/api/v1/politicians');
        setPoliticians(politiciansResponse.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Use mock data for development
        setGeographicData(mockGeographicData);
        setTrendData(mockTrendData);
        setComparativeData(mockComparativeData);
        setPoliticians(mockPoliticians);
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
        Project 2025 Opposition Dashboard
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Geographic Heat Map */}
        <Grid item xs={12}>
          <GeographicHeatMap 
            data={geographicData} 
            title="Geographic Opposition Analysis" 
            description="Heat map showing opposition to Project 2025 by state. Darker colors indicate higher opposition scores."
          />
        </Grid>

        {/* Trend Analysis */}
        <Grid item xs={12}>
          <TrendChart 
            data={trendData} 
            title="Opposition Trend Analysis" 
            description="Trend analysis showing how opposition to Project 2025 has evolved over time."
          />
        </Grid>

        {/* Comparative Analysis */}
        <Grid item xs={12}>
          <ComparativeChart 
            data={comparativeData} 
            politicians={politicians}
            title="Politician Comparative Analysis" 
            description="Compare opposition metrics across different politicians."
          />
        </Grid>
      </Grid>
    </Container>
  );
};

// Mock data for development
const mockGeographicData = [
  { stateCode: 'CA', stateName: 'California', oppositionScore: 78, politicianCount: 53, statementCount: 142 },
  { stateCode: 'TX', stateName: 'Texas', oppositionScore: 32, politicianCount: 38, statementCount: 87 },
  { stateCode: 'NY', stateName: 'New York', oppositionScore: 82, politicianCount: 27, statementCount: 103 },
  { stateCode: 'FL', stateName: 'Florida', oppositionScore: 45, politicianCount: 28, statementCount: 76 },
  { stateCode: 'AL', stateName: 'Alabama', oppositionScore: 28, politicianCount: 9, statementCount: 31 }
];

const mockTrendData = [
  {
    id: 'oppositionScore-overall',
    color: '#ff9800',
    data: [
      { x: '2023-01-01', y: 25 },
      { x: '2023-02-01', y: 28 },
      { x: '2023-03-01', y: 30 },
      { x: '2023-04-01', y: 35 },
      { x: '2023-05-01', y: 38 },
      { x: '2023-06-01', y: 42 },
      { x: '2023-07-01', y: 45 },
      { x: '2023-08-01', y: 48 },
      { x: '2023-09-01', y: 52 },
      { x: '2023-10-01', y: 55 },
      { x: '2023-11-01', y: 58 },
      { x: '2023-12-01', y: 60 },
      { x: '2024-01-01', y: 63 },
      { x: '2024-02-01', y: 65 },
      { x: '2024-03-01', y: 68 },
      { x: '2024-04-01', y: 70 }
    ]
  },
  {
    id: 'oppositionScore-democrat',
    color: '#2c65b1',
    data: [
      { x: '2023-01-01', y: 45 },
      { x: '2023-02-01', y: 48 },
      { x: '2023-03-01', y: 52 },
      { x: '2023-04-01', y: 55 },
      { x: '2023-05-01', y: 58 },
      { x: '2023-06-01', y: 62 },
      { x: '2023-07-01', y: 65 },
      { x: '2023-08-01', y: 68 },
      { x: '2023-09-01', y: 72 },
      { x: '2023-10-01', y: 75 },
      { x: '2023-11-01', y: 78 },
      { x: '2023-12-01', y: 80 },
      { x: '2024-01-01', y: 83 },
      { x: '2024-02-01', y: 85 },
      { x: '2024-03-01', y: 88 },
      { x: '2024-04-01', y: 90 }
    ]
  },
  {
    id: 'oppositionScore-republican',
    color: '#bf2132',
    data: [
      { x: '2023-01-01', y: 5 },
      { x: '2023-02-01', y: 6 },
      { x: '2023-03-01', y: 7 },
      { x: '2023-04-01', y: 8 },
      { x: '2023-05-01', y: 10 },
      { x: '2023-06-01', y: 12 },
      { x: '2023-07-01', y: 15 },
      { x: '2023-08-01', y: 18 },
      { x: '2023-09-01', y: 22 },
      { x: '2023-10-01', y: 25 },
      { x: '2023-11-01', y: 28 },
      { x: '2023-12-01', y: 30 },
      { x: '2024-01-01', y: 33 },
      { x: '2024-02-01', y: 35 },
      { x: '2024-03-01', y: 38 },
      { x: '2024-04-01', y: 40 }
    ]
  },
  {
    id: 'statementCount-overall',
    color: '#ff9800',
    data: [
      { x: '2023-01-01', y: 25 },
      { x: '2023-02-01', y: 35 },
      { x: '2023-03-01', y: 45 },
      { x: '2023-04-01', y: 55 },
      { x: '2023-05-01', y: 65 },
      { x: '2023-06-01', y: 75 },
      { x: '2023-07-01', y: 85 },
      { x: '2023-08-01', y: 95 },
      { x: '2023-09-01', y: 105 },
      { x: '2023-10-01', y: 115 },
      { x: '2023-11-01', y: 125 },
      { x: '2023-12-01', y: 135 },
      { x: '2024-01-01', y: 145 },
      { x: '2024-02-01', y: 155 },
      { x: '2024-03-01', y: 165 },
      { x: '2024-04-01', y: 175 }
    ]
  }
];

const mockComparativeData = [
  { politicianId: 1, name: 'John Smith', party: 'Democrat', oppositionScore: 85, statementCount: 42, mediaAppearances: 15, socialMediaActivity: 78 },
  { politicianId: 2, name: 'Jane Doe', party: 'Republican', oppositionScore: 35, statementCount: 18, mediaAppearances: 8, socialMediaActivity: 45 },
  { politicianId: 3, name: 'Robert Johnson', party: 'Democrat', oppositionScore: 92, statementCount: 53, mediaAppearances: 22, socialMediaActivity: 89 },
  { politicianId: 4, name: 'Sarah Williams', party: 'Republican', oppositionScore: 28, statementCount: 12, mediaAppearances: 5, socialMediaActivity: 32 },
  { politicianId: 5, name: 'Michael Brown', party: 'Independent', oppositionScore: 65, statementCount: 31, mediaAppearances: 11, socialMediaActivity: 56 }
];

const mockPoliticians = [
  { id: 1, name: 'John Smith', party: 'Democrat' },
  { id: 2, name: 'Jane Doe', party: 'Republican' },
  { id: 3, name: 'Robert Johnson', party: 'Democrat' },
  { id: 4, name: 'Sarah Williams', party: 'Republican' },
  { id: 5, name: 'Michael Brown', party: 'Independent' }
];

export default DashboardPage;
