import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  useTheme
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import axios from 'axios';
// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

/**
 * ScoreHistoryChart component displays a politician's score history over time
 * 
 * @param {Object} props
 * @param {string} props.politicianId - UUID of the politician
 * @param {number} props.days - Number of days of history to display
 * @param {boolean} props.showCategories - Whether to show category scores
 */
const ScoreHistoryChart = ({ 
  politicianId, 
  days = 90, 
  showCategories = false 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeRange, setTimeRange] = useState(days);
  const [chartData, setChartData] = useState([]);
  const [displayMode, setDisplayMode] = useState(showCategories ? 'categories' : 'total');

  // Fetch score history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/v1/scoring/politicians/${politicianId}/history?days=${timeRange}`);
        setHistory(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching score history:', err);
        setError('Failed to load score history. Please try again later.');
        setLoading(false);
      }
    };
    
    if (politicianId) {
      fetchHistory();
    }
  }, [politicianId, timeRange]);

  // Process data for chart
  useEffect(() => {
    if (history.length === 0) return;
    
    // Sort by date
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.recorded_date) - new Date(b.recorded_date)
    );
    
    // Format data for chart
    const formattedData = sortedHistory.map(entry => ({
      date: formatDate(entry.recorded_date),
      total: entry.total_score,
      public_statements: entry.public_statements_score,
      legislative_action: entry.legislative_action_score,
      public_engagement: entry.public_engagement_score,
      social_media: entry.social_media_score,
      consistency: entry.consistency_score,
      days_of_silence: entry.days_of_silence,
      rawDate: entry.recorded_date
    }));
    
    setChartData(formattedData);
  }, [history]);

  // Handle time range change
  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  // Handle display mode change
  const handleDisplayModeChange = (event, newDisplayMode) => {
    if (newDisplayMode !== null) {
      setDisplayMode(newDisplayMode);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: entry.color, 
                  mr: 1, 
                  borderRadius: '50%' 
                }} 
              />
              <Typography variant="body2" sx={{ mr: 1 }}>
                {entry.name === 'total' ? 'Total Score' : 
                 entry.name === 'public_statements' ? 'Public Statements' :
                 entry.name === 'legislative_action' ? 'Legislative Action' :
                 entry.name === 'public_engagement' ? 'Public Engagement' :
                 entry.name === 'social_media' ? 'Social Media' :
                 entry.name === 'consistency' ? 'Consistency' :
                 entry.name === 'days_of_silence' ? 'Days of Silence' :
                 entry.name}:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {entry.value}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    
    return null;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Score History
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
            aria-label="time range"
          >
            <ToggleButton value={30} aria-label="30 days">
              30d
            </ToggleButton>
            <ToggleButton value={90} aria-label="90 days">
              90d
            </ToggleButton>
            <ToggleButton value={180} aria-label="180 days">
              180d
            </ToggleButton>
            <ToggleButton value={365} aria-label="1 year">
              1y
            </ToggleButton>
          </ToggleButtonGroup>
          
          {showCategories && (
            <ToggleButtonGroup
              value={displayMode}
              exclusive
              onChange={handleDisplayModeChange}
              size="small"
              aria-label="display mode"
            >
              <ToggleButton value="total" aria-label="total score">
                Total
              </ToggleButton>
              <ToggleButton value="categories" aria-label="category scores">
                Categories
              </ToggleButton>
              <ToggleButton value="silence" aria-label="days of silence">
                Silence
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : chartData.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>No score history available for this time period.</Alert>
      ) : (
        <Paper sx={{ p: 2, height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                domain={displayMode === 'silence' ? [0, 'auto'] : [0, 100]}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {displayMode === 'total' && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Score" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <ReferenceLine y={80} stroke={theme.palette.success.main} strokeDasharray="3 3" />
                  <ReferenceLine y={50} stroke={theme.palette.warning.main} strokeDasharray="3 3" />
                </>
              )}
              
              {displayMode === 'categories' && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="public_statements" 
                    name="Public Statements" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="legislative_action" 
                    name="Legislative Action" 
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="public_engagement" 
                    name="Public Engagement" 
                    stroke={theme.palette.success.main} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="social_media" 
                    name="Social Media" 
                    stroke={theme.palette.warning.main} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consistency" 
                    name="Consistency" 
                    stroke={theme.palette.error.main} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </>
              )}
              
              {displayMode === 'silence' && (
                <Line 
                  type="monotone" 
                  dataKey="days_of_silence" 
                  name="Days of Silence" 
                  stroke={theme.palette.error.main} 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ScoreHistoryChart;
