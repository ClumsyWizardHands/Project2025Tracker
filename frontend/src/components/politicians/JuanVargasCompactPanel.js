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
 * JuanVargasCompactPanel component displays a compact assessment of Juan Vargas
 * for embedding in Evidence files and other places in the application
 */
const JuanVargasCompactPanel = () => {
  const theme = useTheme();
  
  // Juan Vargas data
  const data = {
    "representative": "Juan Vargas",
    "district": "CA-52",
    "numericalScore": 71,
    "totalPossible": 100,
    "finalAccountabilityTag": "Active Resistor",
    "strategicIntegritySummary": "Rep. Juan Vargas exhibits a consistent oppositional stance against authoritarian-leaning policies, particularly those associated with Project 2025. His legislative efforts and public statements align with pro-democracy values. However, there is a lack of evidence showing the use of strategic legislative tools or high-risk public engagements to actively disrupt authoritarian advancements."
  };
  
  return (
    <Card sx={{ mb: 2, borderLeft: `4px solid ${theme.palette.info.main}` }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h3">
                {data.representative} ({data.district})
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
              to="/politicians/juan-vargas"
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

export default JuanVargasCompactPanel;
