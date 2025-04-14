import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert, 
  Pagination, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ScoreCard from './ScoreCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * ScoreList component displays a list of politicians with their scores
 * 
 * @param {Object} props
 * @param {string} props.type - Type of list to display ('top', 'bottom', or 'all')
 * @param {number} props.limit - Number of politicians to display
 * @param {string} props.title - Title for the list
 * @param {boolean} props.showFilters - Whether to show filtering options
 */
const ScoreList = ({ 
  type = 'all', 
  limit = 10, 
  title = 'Politicians', 
  showFilters = true 
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scores, setScores] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    party: '',
    state: '',
    search: '',
    sortBy: 'score',
    sortOrder: 'desc'
  });
  const [states, setStates] = useState([]);

  // Fetch scores based on type and filters
  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let endpoint;
        
        switch (type) {
          case 'top':
            endpoint = `/api/v1/scoring/leaderboard/top?limit=${limit}`;
            break;
          case 'bottom':
            endpoint = `/api/v1/scoring/leaderboard/bottom?limit=${limit}`;
            break;
          default:
            endpoint = `/api/v1/politicians?page=${page}&limit=${limit}`;
        }
        
        // Add filters to endpoint
        if (filters.party) {
          endpoint += `&party=${filters.party}`;
        }
        
        if (filters.state) {
          endpoint += `&state=${filters.state}`;
        }
        
        if (filters.search) {
          endpoint += `&search=${encodeURIComponent(filters.search)}`;
        }
        
        if (type === 'all') {
          endpoint += `&sortBy=${filters.sortBy}&sortOrder=${filters.sortOrder}`;
        }
        
        const response = await axios.get(endpoint);
        
        if (type === 'all') {
          // For 'all' type, we need to fetch scores for each politician
          const politicians = response.data.data.politicians;
          setTotalPages(response.data.data.pagination.totalPages);
          
          // Fetch scores for each politician
          const scorePromises = politicians.map(politician => 
            axios.get(`/api/v1/scoring/politicians/${politician.id}`)
          );
          
          const scoreResponses = await Promise.all(scorePromises);
          const politicianScores = scoreResponses.map((scoreResponse, index) => ({
            ...scoreResponse.data.data,
            politician: politicians[index]
          }));
          
          setScores(politicianScores);
        } else {
          // For 'top' and 'bottom' types, scores are already included
          setScores(response.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching scores:', err);
        setError('Failed to load scores. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchScores();
  }, [type, limit, page, filters]);

  // Fetch states for filter
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get('/api/v1/politicians/states');
        setStates(response.data.data);
      } catch (err) {
        console.error('Error fetching states:', err);
      }
    };
    
    if (showFilters) {
      fetchStates();
    }
  }, [showFilters]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  // Handle search
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setFilters(prev => ({ ...prev, search: event.target.value }));
      setPage(1);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      party: '',
      state: '',
      search: '',
      sortBy: 'score',
      sortOrder: 'desc'
    });
    setPage(1);
  };

  // Navigate to politician detail page
  const handlePoliticianClick = (politicianId) => {
    navigate(`/politicians/${politicianId}`);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        
        {showFilters && (
          <Stack direction="row" spacing={1}>
            <Chip 
              icon={<FilterListIcon />} 
              label={`Filters: ${Object.values(filters).filter(v => v && v !== 'score' && v !== 'desc').length}`}
              color={Object.values(filters).filter(v => v && v !== 'score' && v !== 'desc').length > 0 ? "primary" : "default"}
              onClick={handleClearFilters}
              onDelete={Object.values(filters).filter(v => v && v !== 'score' && v !== 'desc').length > 0 ? handleClearFilters : undefined}
            />
          </Stack>
        )}
      </Box>
      
      {showFilters && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search Politicians"
                variant="outlined"
                defaultValue={filters.search}
                onKeyPress={handleSearch}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Party</InputLabel>
                <Select
                  name="party"
                  value={filters.party}
                  onChange={handleFilterChange}
                  label="Party"
                >
                  <MenuItem value="">All Parties</MenuItem>
                  <MenuItem value="Democrat">Democrat</MenuItem>
                  <MenuItem value="Republican">Republican</MenuItem>
                  <MenuItem value="Independent">Independent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  label="State"
                >
                  <MenuItem value="">All States</MenuItem>
                  {states.map(state => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Sort By</InputLabel>
                <Select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  label="Sort By"
                  startAdornment={<SortIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="score">Score</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="party">Party</MenuItem>
                  <MenuItem value="state">State</MenuItem>
                  <MenuItem value="silence">Days of Silence</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Order</InputLabel>
                <Select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  label="Order"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : scores.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>No politicians found matching your criteria.</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {scores.map(score => (
              <Grid item xs={12} sm={6} md={4} key={score.id || (score.politician && score.politician.id)}>
                <ScoreCard 
                  score={score} 
                  onClick={() => handlePoliticianClick(score.politician.id)}
                />
              </Grid>
            ))}
          </Grid>
          
          {type === 'all' && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ScoreList;
