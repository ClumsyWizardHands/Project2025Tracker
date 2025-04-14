import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, Grid, Divider, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

// Styled components
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
    fontSize: '1rem',
    padding: theme.spacing(1),
    height: 'auto',
  };
});

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
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.palette.grey[300],
    '& .MuiLinearProgress-bar': {
      backgroundColor: color,
    },
  };
});

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color, icon;
  
  switch (status) {
    case 'WHISTLEBLOWER':
      color = theme.palette.success.main;
      icon = <NotificationsActiveIcon />;
      break;
    case 'UNDER SURVEILLANCE':
      color = theme.palette.warning.main;
      icon = <SecurityIcon />;
      break;
    default: // PERSON OF INTEREST
      color = theme.palette.error.main;
      icon = <WarningIcon />;
  }
  
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 'bold',
    '& .MuiChip-icon': {
      color: 'inherit',
    },
  };
});

/**
 * ScoreCard component displays a politician's score information
 * 
 * @param {Object} props
 * @param {Object} props.score - The politician's score data
 * @param {boolean} props.detailed - Whether to show detailed breakdown
 * @param {Function} props.onClick - Click handler for the card
 */
const ScoreCard = ({ score, detailed = false, onClick }) => {
  const theme = useTheme();
  
  if (!score) {
    return (
      <Card sx={{ mb: 2, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
        <CardContent>
          <Typography variant="h6" align="center">
            No score data available
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  const {
    total_score,
    public_statements_score,
    legislative_action_score,
    public_engagement_score,
    social_media_score,
    consistency_score,
    days_of_silence,
    status,
    politician
  } = score;
  
  const politicianName = politician ? politician.name : 'Unknown Politician';
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': onClick ? {
          transform: 'scale(1.02)',
          boxShadow: 3,
        } : {}
      }} 
      onClick={onClick}
    >
      <CardContent>
        {politician && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="div">
              {politicianName}
            </Typography>
            <StatusChip 
              label={status} 
              status={status}
              icon={
                status === 'WHISTLEBLOWER' ? <NotificationsActiveIcon /> :
                status === 'UNDER SURVEILLANCE' ? <SecurityIcon /> :
                <WarningIcon />
              }
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Overall Score
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={total_score} 
              sx={{ 
                height: 20, 
                borderRadius: 2,
                backgroundColor: theme.palette.grey[300],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 
                    total_score >= 80 ? theme.palette.success.main :
                    total_score >= 50 ? theme.palette.warning.main :
                    theme.palette.error.main,
                },
              }}
            />
          </Box>
          <ScoreChip label={`${total_score}/100`} score={total_score} />
        </Box>
        
        <Tooltip title="Days since last recorded activity">
          <Chip 
            label={`${days_of_silence} days of silence`} 
            color={days_of_silence > 30 ? "error" : days_of_silence > 14 ? "warning" : "success"}
            size="small"
            sx={{ mb: 2 }}
          />
        </Tooltip>
        
        {detailed && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Score Breakdown
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Public Statements ({public_statements_score}%)
                </Typography>
                <CategoryProgress variant="determinate" value={public_statements_score} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Legislative Action ({legislative_action_score}%)
                </Typography>
                <CategoryProgress variant="determinate" value={legislative_action_score} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Public Engagement ({public_engagement_score}%)
                </Typography>
                <CategoryProgress variant="determinate" value={public_engagement_score} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Social Media ({social_media_score}%)
                </Typography>
                <CategoryProgress variant="determinate" value={social_media_score} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Consistency ({consistency_score}%)
                </Typography>
                <CategoryProgress variant="determinate" value={consistency_score} />
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
