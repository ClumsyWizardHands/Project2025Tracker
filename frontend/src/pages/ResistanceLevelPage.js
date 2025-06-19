import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  LinearProgress,
  Divider,
  Paper,
  Button,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import axios from 'axios';

// Styled components
const ResistanceLevelBanner = styled(Paper)(({ theme, level }) => {
  let color;
  
  switch (level) {
    case 'Defender':
      color = theme.palette.success.main;
      break;
    case 'Active Resistor':
      color = theme.palette.info.main;
      break;
    case 'Inconsistent Advocate':
      color = theme.palette.warning.main;
      break;
    default: // Complicit Enabler
      color = theme.palette.error.main;
  }
  
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    textAlign: 'center',
  };
});

const ScoreChip = styled(Chip)(({ theme, score }) => {
  let color;
  if (score >= 80) {
    color = theme.palette.success.main;
  } else if (score >= 50) {
    color = theme.palette.warning.main;
  } else {
    color = theme.palette.error.main;
  }
  
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  };
});

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'WHISTLEBLOWER':
      return <NotificationsActiveIcon color="success" />;
    case 'UNDER SURVEILLANCE':
      return <SecurityIcon color="warning" />;
    default: // PERSON OF INTEREST
      return <WarningIcon color="error" />;
  }
};

/**
 * ResistanceLevelPage displays politicians by their resistance level
 */
const ResistanceLevelPage = () => {
  const { level } = useParams();
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format level for display
  const formattedLevel = level || 'Unknown';
  
  // Get description based on level
  const getLevelDescription = () => {
    switch (level) {
      case 'Defender':
        return 'These politicians actively oppose Project 2025 through consistent, high-impact actions. They demonstrate strategic integrity and effectively use their position power to resist authoritarian policies.';
      case 'Active Resistor':
        return 'These politicians regularly take action against Project 2025, though they may not always maximize their position power or maintain perfect consistency between words and actions.';
      case 'Inconsistent Advocate':
        return 'These politicians occasionally speak out against Project 2025, but their actions don\'t consistently align with their rhetoric. They may engage in performative resistance without substantive follow-through.';
      case 'Complicit Enabler':
        return 'These politicians either actively support Project 2025 or fail to take meaningful action against it despite having the position and opportunity to do so.';
      default:
        return 'No description available for this resistance level.';
    }
  };
  
  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/enhanced-scoring/resistance-level/${level}`);
        setPoliticians(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching politicians:', err);
        setError('Failed to load politicians for this resistance level');
      } finally {
        setLoading(false);
      }
    };
    
    if (level) {
      fetchPoliticians();
    }
  }, [level]);
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Loading...
        </Typography>
        <LinearProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link
          component={RouterLink}
          to="/politicians"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Politicians
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          {formattedLevel}
        </Typography>
      </Breadcrumbs>
      
      {/* Resistance Level Banner */}
      <ResistanceLevelBanner level={level} elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {formattedLevel}
        </Typography>
        <Typography variant="subtitle1">
          {getLevelDescription()}
        </Typography>
      </ResistanceLevelBanner>
      
      {/* Politicians Grid */}
      {politicians.length === 0 ? (
        <Alert severity="info">
          No politicians found with this resistance level.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {politicians.map((item) => {
            const politician = item.politician;
            const score = item.total_score;
            const status = item.status || (
              score >= 80 ? 'WHISTLEBLOWER' : 
              score >= 50 ? 'UNDER SURVEILLANCE' : 
              'PERSON OF INTEREST'
            );
            
            return (
              <Grid item xs={12} sm={6} md={4} key={politician.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    }
                  }}
                >
                  <ScoreChip label={`${score}/100`} score={score} />
                  
                  <CardActionArea 
                    component={RouterLink} 
                    to={`/politicians/${politician.id}`}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={politician.photo_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={politician.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div" noWrap>
                          {politician.name}
                        </Typography>
                        <StatusIcon status={status} />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {politician.party} • {politician.state}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {politician.position}
                      </Typography>
                      
                      {politician.committees && politician.committees.length > 0 && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            <strong>Committees:</strong> {politician.committees.map(c => c.committee_name).join(', ')}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Navigation Buttons */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          component={RouterLink} 
          to="/politicians"
        >
          View All Politicians
        </Button>
        
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/"
        >
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default ResistanceLevelPage;
