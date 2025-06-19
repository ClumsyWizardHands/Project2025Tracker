import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  Chip, 
  Button,
  LinearProgress,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoIcon from '@mui/icons-material/Info';

// Styled components
const CategoryProgress = styled(LinearProgress)(({ theme, value }) => {
  let color;
  if (value >= 80) {
    color = theme.palette.success.main;
  } else if (value >= 50) {
    color = theme.palette.warning.main;
  } else {
    color = theme.palette.error.main;
  }
  
  return {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[300],
    '& .MuiLinearProgress-bar': {
      backgroundColor: color,
    },
  };
});

const ResistanceLevelChip = styled(Chip)(({ theme, level }) => {
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
    fontWeight: 'bold',
    height: 'auto',
    '& .MuiChip-label': {
      padding: theme.spacing(0.5, 1),
    }
  };
});

/**
 * MichaelBennetCompactPanel component displays a compact assessment of Michael Bennet
 * for embedding in Evidence files and other places in the application
 */
const MichaelBennetCompactPanel = () => {
  const theme = useTheme();
  
  // Michael Bennet data
  const data = {
    "representative": "Michael Bennet",
    "state": "Colorado",
    "party": "Democrat",
    "position": "U.S. Senator",
    "numericalScore": 63,
    "totalPossible": 100,
    "finalAccountabilityTag": "Inconsistent Advocate",
    "strategicIntegritySummary": "Senator Michael Bennet demonstrates a consistent commitment to resisting authoritarian policies through public statements and legislative efforts. His recent decision to run for Colorado governor underscores his dedication to opposing authoritarian influences at both state and national levels. However, there is room for increased strategic disruption and direct opposition to initiatives like Project 2025."
  };
  
  return (
    <Card sx={{ mb: 2, borderLeft: `4px solid ${theme.palette.warning.main}` }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h3">
                {data.representative} ({data.state})
              </Typography>
              <ResistanceLevelChip 
                label={data.finalAccountabilityTag}
                level={data.finalAccountabilityTag}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flexGrow: 1, mr: 1 }}>
                <CategoryProgress variant="determinate" value={(data.numericalScore / data.totalPossible) * 100} />
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {data.numericalScore}/{data.totalPossible}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {data.strategicIntegritySummary}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to="/politicians/michael-bennet"
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<AssessmentIcon />}
            >
              View Analysis
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MichaelBennetCompactPanel;
