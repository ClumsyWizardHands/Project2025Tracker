import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PoliticianCard from '../components/politicians/PoliticianCard';
import JuanVargasCompactPanel from '../components/politicians/JuanVargasCompactPanel';
import TammyBaldwinCompactPanel from '../components/politicians/TammyBaldwinCompactPanel';
import JohnBarrassoCompactPanel from '../components/politicians/JohnBarrassoCompactPanel';
import MichaelBennetCompactPanel from '../components/politicians/MichaelBennetCompactPanel';

// Helper function to parse query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const PoliticiansPage = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const { isAdmin } = useAuth();
  
  // State for politicians data
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filters
  const [filters, setFilters] = useState({
    search: query.get('search') || '',
    party: query.get('party') || '',
    state: query.get('state') || '',
    position: query.get('position') || '',
    page: parseInt(query.get('page')) || 1,
    limit: 12,
  });
  
  // State for available filter options
  const [filterOptions, setFilterOptions] = useState({
    parties: [],
    states: [],
    positions: [],
  });
  
  // Check if search includes featured politicians
  const [showJuanVargas, setShowJuanVargas] = useState(false);
  const [showTammyBaldwin, setShowTammyBaldwin] = useState(false);
  const [showJohnBarrasso, setShowJohnBarrasso] = useState(false);
  const [showMichaelBennet, setShowMichaelBennet] = useState(false);
  
  // Fetch politicians data
  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if search includes featured politicians
        const searchLower = filters.search.toLowerCase();
        
        // Check for Juan Vargas
        setShowJuanVargas(
          searchLower.includes('juan') || 
          searchLower.includes('vargas') || 
          searchLower.includes('ca-52') ||
          (filters.state === 'California' && filters.party === 'Democrat') ||
          filters.search === ''  // Also show when no search is applied
        );
        
        // Check for Tammy Baldwin
        setShowTammyBaldwin(
          searchLower.includes('tammy') || 
          searchLower.includes('baldwin') || 
          searchLower.includes('wisconsin') ||
          (filters.state === 'Wisconsin' && filters.party === 'Democrat') ||
          filters.search === ''  // Also show when no search is applied
        );
        
        // Check for John Barrasso
        setShowJohnBarrasso(
          searchLower.includes('john') || 
          searchLower.includes('barrasso') || 
          searchLower.includes('wyoming') ||
          (filters.state === 'Wyoming' && filters.party === 'Republican') ||
          filters.search === ''  // Also show when no search is applied
        );
        
        // Check for Michael Bennet
        setShowMichaelBennet(
          searchLower.includes('michael') || 
          searchLower.includes('bennet') || 
          searchLower.includes('colorado') ||
          (filters.state === 'Colorado' && filters.party === 'Democrat') ||
          filters.search === ''  // Also show when no search is applied
        );
        
        // Build query parameters
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.party) params.append('party', filters.party);
        if (filters.state) params.append('state', filters.state);
        if (filters.position) params.append('position', filters.position);
        params.append('page', filters.page);
        params.append('limit', filters.limit);
        
        // Update URL with query parameters
        navigate({
          pathname: '/politicians',
          search: params.toString(),
        }, { replace: true });
        
        // Fetch politicians
        const response = await axios.get(`/api/v1/politicians?${params.toString()}`);
        
        if (response.data && response.data.data) {
          setPoliticians(response.data.data.politicians);
          setTotalPages(response.data.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Error fetching politicians:', err);
        setError('Failed to load politicians. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPoliticians();
  }, [filters, navigate]);
  
  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // In a real application, you would fetch these from the API
        // For now, we'll use mock data
        
        // Fetch unique parties
        const partiesResponse = await axios.get('/api/v1/politicians/filters/parties');
        
        // Fetch unique states
        const statesResponse = await axios.get('/api/v1/politicians/filters/states');
        
        // Fetch unique positions
        const positionsResponse = await axios.get('/api/v1/politicians/filters/positions');
        
        setFilterOptions({
          parties: partiesResponse.data.data || [],
          states: statesResponse.data.data || [],
          positions: positionsResponse.data.data || [],
        });
      } catch (err) {
        console.error('Error fetching filter options:', err);
        // Fallback to empty arrays if API fails
        setFilterOptions({
          parties: [],
          states: [],
          positions: [],
        });
      }
    };
    
    // Comment out for now since these endpoints don't exist yet
    // fetchFilterOptions();
    
    // Mock data for development
    setFilterOptions({
      parties: ['Democrat', 'Republican', 'Independent'],
      states: ['Alabama', 'Alaska', 'Arizona', 'California', 'New York', 'Texas'],
      positions: ['Senator', 'Representative', 'Governor'],
    });
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    setFilters({
      ...filters,
      [name]: value,
      page: 1, // Reset to first page when filters change
    });
  };
  
  // Handle search input
  const handleSearchChange = (event) => {
    setFilters({
      ...filters,
      search: event.target.value,
    });
  };
  
  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    
    setFilters({
      ...filters,
      page: 1, // Reset to first page when search changes
    });
  };
  
  // Clear search
  const handleClearSearch = () => {
    setFilters({
      ...filters,
      search: '',
      page: 1, // Reset to first page when search is cleared
    });
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      party: '',
      state: '',
      position: '',
      page: 1,
      limit: filters.limit,
    });
  };
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    setFilters({
      ...filters,
      page: value,
    });
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Navigate to add politician page
  const handleAddPolitician = () => {
    navigate('/politicians/add');
  };
  
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" color="primary">
            Politicians
          </Typography>
          
          {isAdmin && isAdmin() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddPolitician}
            >
              Add Politician
            </Button>
          )}
        </Box>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box component="form" onSubmit={handleSearchSubmit} mb={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search politicians..."
              value={filters.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box display="flex" flexWrap="wrap" gap={2}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="party-filter-label">Party</InputLabel>
              <Select
                labelId="party-filter-label"
                id="party-filter"
                name="party"
                value={filters.party}
                label="Party"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Parties</MenuItem>
                {filterOptions.parties.map((party) => (
                  <MenuItem key={party} value={party}>
                    {party}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="state-filter-label">State</InputLabel>
              <Select
                labelId="state-filter-label"
                id="state-filter"
                name="state"
                value={filters.state}
                label="State"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All States</MenuItem>
                {filterOptions.states.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="position-filter-label">Position</InputLabel>
              <Select
                labelId="position-filter-label"
                id="position-filter"
                name="position"
                value={filters.position}
                label="Position"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Positions</MenuItem>
                {filterOptions.positions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {(filters.party || filters.state || filters.position) && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
              >
                Clear Filters
              </Button>
            )}
          </Box>
          
          {/* Active filters */}
          {(filters.search || filters.party || filters.state || filters.position) && (
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Active Filters:
              </Typography>
              
              {filters.search && (
                <Chip
                  label={`Search: ${filters.search}`}
                  onDelete={handleClearSearch}
                  size="small"
                />
              )}
              
              {filters.party && (
                <Chip
                  label={`Party: ${filters.party}`}
                  onDelete={() => handleFilterChange({ target: { name: 'party', value: '' } })}
                  size="small"
                />
              )}
              
              {filters.state && (
                <Chip
                  label={`State: ${filters.state}`}
                  onDelete={() => handleFilterChange({ target: { name: 'state', value: '' } })}
                  size="small"
                />
              )}
              
              {filters.position && (
                <Chip
                  label={`Position: ${filters.position}`}
                  onDelete={() => handleFilterChange({ target: { name: 'position', value: '' } })}
                  size="small"
                />
              )}
            </Box>
          )}
        </Paper>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : politicians.length === 0 && !showJuanVargas ? (
          <Alert severity="info" sx={{ my: 2 }}>
            No politicians found matching your criteria.
          </Alert>
        ) : (
          <>
            {/* Featured Assessments */}
            {(showJuanVargas || showTammyBaldwin || showJohnBarrasso || showMichaelBennet) && (
              <Box sx={{ mb: 4 }}>
                <Paper sx={{ p: 3, mb: 2, borderLeft: '4px solid #2196f3' }}>
                  <Typography variant="h5" gutterBottom>
                    Featured Assessments
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    These politicians have been analyzed using our enhanced scoring methodology:
                  </Typography>
                  
                  {showJuanVargas && (
                    <Box onClick={() => navigate('/politicians/juan-vargas')} sx={{ cursor: 'pointer', mb: 2 }}>
                      <JuanVargasCompactPanel />
                    </Box>
                  )}
                  
                  {showTammyBaldwin && (
                    <Box onClick={() => navigate('/politicians/tammy-baldwin')} sx={{ cursor: 'pointer', mb: 2 }}>
                      <TammyBaldwinCompactPanel />
                    </Box>
                  )}
                  
                  {showJohnBarrasso && (
                    <Box onClick={() => navigate('/politicians/john-barrasso')} sx={{ cursor: 'pointer', mb: 2 }}>
                      <JohnBarrassoCompactPanel />
                    </Box>
                  )}
                  
                  {showMichaelBennet && (
                    <Box onClick={() => navigate('/politicians/michael-bennet')} sx={{ cursor: 'pointer' }}>
                      <MichaelBennetCompactPanel />
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
            
            {/* Add featured politicians to the politicians list if they're not already there */}
            <Grid container spacing={3}>
              {/* If we're showing Juan Vargas but he's not in the politicians list, add a card for him */}
              {showJuanVargas && !politicians.some(p => p.id === 'juan-vargas') && (
                <Grid item xs={12} sm={6} md={4}>
                  <PoliticianCard 
                    politician={{
                      id: 'juan-vargas',
                      name: 'Juan Vargas',
                      party: 'Democrat',
                      state: 'California',
                      position: 'Representative',
                      district: 'CA-52',
                      photo_url: 'https://vargas.house.gov/sites/evo-subsites/vargas.house.gov/files/evo-media-image/Official%20Photo%20-%20Rep.%20Juan%20Vargas.jpg'
                    }} 
                  />
                </Grid>
              )}
              
              {/* If we're showing Tammy Baldwin but she's not in the politicians list, add a card for her */}
              {showTammyBaldwin && !politicians.some(p => p.id === 'tammy-baldwin') && (
                <Grid item xs={12} sm={6} md={4}>
                  <PoliticianCard 
                    politician={{
                      id: 'tammy-baldwin',
                      name: 'Tammy Baldwin',
                      party: 'Democrat',
                      state: 'Wisconsin',
                      position: 'U.S. Senator',
                      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Tammy_Baldwin%2C_official_portrait%2C_113th_Congress.jpg'
                    }} 
                  />
                </Grid>
              )}
              
              {/* If we're showing John Barrasso but he's not in the politicians list, add a card for him */}
              {showJohnBarrasso && !politicians.some(p => p.id === 'john-barrasso') && (
                <Grid item xs={12} sm={6} md={4}>
                  <PoliticianCard 
                    politician={{
                      id: 'john-barrasso',
                      name: 'John Barrasso',
                      party: 'Republican',
                      state: 'Wyoming',
                      position: 'U.S. Senator',
                      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/John_Barrasso_official_portrait_112th_Congress.jpg'
                    }} 
                  />
                </Grid>
              )}
              
              {/* If we're showing Michael Bennet but he's not in the politicians list, add a card for him */}
              {showMichaelBennet && !politicians.some(p => p.id === 'michael-bennet') && (
                <Grid item xs={12} sm={6} md={4}>
                  <PoliticianCard 
                    politician={{
                      id: 'michael-bennet',
                      name: 'Michael Bennet',
                      party: 'Democrat',
                      state: 'Colorado',
                      position: 'U.S. Senator',
                      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Michael_Bennet_Official_Photo.jpg/800px-Michael_Bennet_Official_Photo.jpg'
                    }} 
                  />
                </Grid>
              )}
              
              {politicians.map((politician) => (
                <Grid item xs={12} sm={6} md={4} key={politician.id}>
                  <PoliticianCard politician={politician} />
                </Grid>
              ))}
            </Grid>
            
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default PoliticiansPage;
