import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import PredictiveModel from '../../components/analytics/PredictiveModel';

const PredictiveAnalyticsPage = () => {
  const { currentUser, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictiveData, setPredictiveData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has researcher or admin role
        if (!hasRole(['researcher', 'admin'])) {
          setError('You do not have permission to access this page.');
          setLoading(false);
          return;
        }

        // Fetch predictive data
        const response = await axios.get('/api/v1/analytics/predictive');
        setPredictiveData(response.data.data);
      } catch (err) {
        console.error('Error fetching predictive data:', err);
        setError('Failed to load predictive data. Please try again later.');
        
        // Use mock data for development
        setPredictiveData(mockPredictiveData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasRole]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress sx={{ color: '#ff9800' }} />
        </Box>
      </Container>
    );
  }

  if (error && error === 'You do not have permission to access this page.') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          This page is only accessible to researchers and administrators.
        </Typography>
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
        Predictive Analytics
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PredictiveModel 
            data={predictiveData} 
            title="Politician Behavior Prediction Model" 
            description="Predictive model showing likely future behaviors of politicians regarding Project 2025, including voting patterns, public statements, and silence probability."
          />
        </Grid>
      </Grid>
    </Container>
  );
};

// Mock data for development
const mockPredictiveData = [
  {
    id: 1,
    name: 'John Smith',
    party: 'Democrat',
    predictionType: 'voting',
    prediction: 'Will vote against Project 2025 initiatives',
    confidence: 92,
    riskLevel: 'low',
    keyFactors: [
      { name: 'Past Voting', description: 'Consistently voted against similar initiatives' },
      { name: 'Public Statements', description: 'Made 15 public statements opposing Project 2025' },
      { name: 'Constituent Base', description: 'Represents a district strongly opposed to Project 2025' }
    ],
    recommendedAction: 'Continue monitoring',
    actionDetails: 'No immediate action required. Continue tracking statements and votes.'
  },
  {
    id: 2,
    name: 'Jane Doe',
    party: 'Republican',
    predictionType: 'voting',
    prediction: 'Will likely support Project 2025 initiatives',
    confidence: 78,
    riskLevel: 'high',
    keyFactors: [
      { name: 'Past Voting', description: 'Voted for similar initiatives in the past' },
      { name: 'Donor Influence', description: 'Major donors support Project 2025' },
      { name: 'Party Pressure', description: 'Facing pressure from party leadership' }
    ],
    recommendedAction: 'Targeted outreach',
    actionDetails: 'Organize constituent calls and meetings. Highlight potential negative impacts on her district.'
  },
  {
    id: 3,
    name: 'Robert Johnson',
    party: 'Democrat',
    predictionType: 'voting',
    prediction: 'Will vote against Project 2025 initiatives',
    confidence: 95,
    riskLevel: 'low',
    keyFactors: [
      { name: 'Past Voting', description: 'Strong voting record against similar initiatives' },
      { name: 'Leadership Position', description: 'Has taken a leadership role in opposition' },
      { name: 'Public Statements', description: 'Made 22 public statements opposing Project 2025' }
    ],
    recommendedAction: 'Leverage as ally',
    actionDetails: 'Engage as a spokesperson and coalition builder against Project 2025.'
  },
  {
    id: 4,
    name: 'Sarah Williams',
    party: 'Republican',
    predictionType: 'voting',
    prediction: 'May vote for some Project 2025 initiatives',
    confidence: 65,
    riskLevel: 'medium',
    keyFactors: [
      { name: 'Moderate Voting', description: 'Has broken with party on similar issues' },
      { name: 'Electoral Vulnerability', description: 'Represents a purple district' },
      { name: 'Limited Statements', description: 'Has made few public statements on the issue' }
    ],
    recommendedAction: 'Educational outreach',
    actionDetails: 'Provide detailed information on impacts to her district. Organize constituent meetings.'
  },
  {
    id: 5,
    name: 'Michael Brown',
    party: 'Independent',
    predictionType: 'voting',
    prediction: 'Will likely vote against Project 2025 initiatives',
    confidence: 70,
    riskLevel: 'medium',
    keyFactors: [
      { name: 'Voting History', description: 'Mixed voting record on similar issues' },
      { name: 'Public Statements', description: 'Has expressed concerns about parts of Project 2025' },
      { name: 'Constituent Pressure', description: 'Facing constituent pressure to oppose' }
    ],
    recommendedAction: 'Targeted information',
    actionDetails: 'Provide specific information addressing his concerns. Organize expert briefings.'
  },
  {
    id: 6,
    name: 'John Smith',
    party: 'Democrat',
    predictionType: 'statements',
    prediction: 'Will continue to make strong public statements',
    confidence: 88,
    riskLevel: 'low',
    keyFactors: [
      { name: 'Media Presence', description: 'Regular media appearances discussing the issue' },
      { name: 'Social Media', description: 'Active on social media with consistent messaging' },
      { name: 'Leadership Role', description: 'Has positioned himself as a leader on this issue' }
    ],
    recommendedAction: 'Amplify messaging',
    actionDetails: 'Provide talking points and research. Share and amplify statements across platforms.'
  },
  {
    id: 7,
    name: 'Jane Doe',
    party: 'Republican',
    predictionType: 'statements',
    prediction: 'Will likely avoid public statements',
    confidence: 82,
    riskLevel: 'high',
    keyFactors: [
      { name: 'Past Behavior', description: 'Has avoided commenting on controversial issues' },
      { name: 'Electoral Strategy', description: 'Trying to appeal to moderate voters' },
      { name: 'Media Avoidance', description: 'Limited media appearances on policy issues' }
    ],
    recommendedAction: 'Media pressure',
    actionDetails: 'Work with journalists to ask direct questions. Highlight absence of position statements.'
  },
  {
    id: 8,
    name: 'Sarah Williams',
    party: 'Republican',
    predictionType: 'silence',
    prediction: 'High probability of remaining silent',
    confidence: 85,
    riskLevel: 'high',
    keyFactors: [
      { name: 'Electoral Vulnerability', description: 'Represents a competitive district' },
      { name: 'Donor Pressure', description: 'Major donors support Project 2025' },
      { name: 'Past Behavior', description: 'Has avoided taking positions on divisive issues' }
    ],
    recommendedAction: 'Force position taking',
    actionDetails: 'Create public pressure through constituent questions at events. Work with media to request statements.'
  },
  {
    id: 9,
    name: 'Michael Brown',
    party: 'Independent',
    predictionType: 'silence',
    prediction: 'Medium probability of remaining silent',
    confidence: 60,
    riskLevel: 'medium',
    keyFactors: [
      { name: 'Strategic Positioning', description: 'Trying to maintain independent image' },
      { name: 'Limited Knowledge', description: 'May not be fully informed on all aspects' },
      { name: 'Constituent Division', description: 'Constituents divided on the issue' }
    ],
    recommendedAction: 'Educational outreach',
    actionDetails: 'Provide detailed briefings on Project 2025. Connect with respected community leaders in his district.'
  },
  {
    id: 10,
    name: 'Robert Johnson',
    party: 'Democrat',
    predictionType: 'silence',
    prediction: 'Low probability of remaining silent',
    confidence: 95,
    riskLevel: 'low',
    keyFactors: [
      { name: 'Outspoken History', description: 'Consistently speaks out on policy issues' },
      { name: 'Leadership Role', description: 'Has taken a leadership position in opposition' },
      { name: 'Media Presence', description: 'Regular media appearances discussing policy' }
    ],
    recommendedAction: 'Leverage as spokesperson',
    actionDetails: 'Provide research and talking points. Coordinate media opportunities.'
  }
];

export default PredictiveAnalyticsPage;
