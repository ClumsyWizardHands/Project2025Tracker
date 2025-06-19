import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Divider, 
  Chip, 
  Button,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';

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
    height: 10,
    borderRadius: 5,
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
 * JohnBarrassoPanel component displays a detailed assessment of John Barrasso
 */
const JohnBarrassoPanel = () => {
  const theme = useTheme();
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // John Barrasso data
  const data = {
    "representative": "John Barrasso",
    "state": "Wyoming",
    "party": "Republican",
    "position": "U.S. Senator",
    "numericalScore": 19,
    "totalPossible": 100,
    "categories": {
      "publicStatementsAndAdvocacy": {
        "score": 4,
        "maxPoints": 30,
        "actions": "Senator Barrasso has publicly criticized President Biden's energy policies, advocating for increased fossil fuel production.",
        "assessment": "His statements align with policies that support authoritarian acceleration, lacking strategic resistance."
      },
      "legislativeActionAndOversight": {
        "score": 3,
        "maxPoints": 25,
        "actions": "Co-introduced the Energy Permitting Reform Act of 2024 with Senator Joe Manchin, aiming to expedite fossil fuel projects.",
        "assessment": "Legislative efforts facilitate authoritarian-aligned policies, with no evidence of procedural obstruction."
      },
      "publicAndCommunityEngagement": {
        "score": 5,
        "maxPoints": 20,
        "actions": "Engaged with constituents through events and social media, including visits to schools and community gatherings.",
        "assessment": "Engagements are standard and lack adversarial or high-risk elements opposing authoritarian policies."
      },
      "socialMediaAndDigitalOutreach": {
        "score": 4,
        "maxPoints": 15,
        "actions": "Active on social media, promoting policies aligned with Project 2025 and criticizing opposing viewpoints.",
        "assessment": "Digital outreach supports authoritarian-aligned narratives without mobilizing resistance."
      },
      "consistencyAndDeepImpact": {
        "score": 3,
        "maxPoints": 10,
        "actions": "Consistently supports policies that align with authoritarian acceleration, including energy and environmental deregulation.",
        "assessment": "Demonstrates long-term alignment with authoritarian-enabling policies."
      }
    },
    "strategicIntegritySummary": "Senator John Barrasso's actions and statements consistently support policies that align with authoritarian acceleration, particularly in the energy sector. His legislative initiatives and public advocacy lack elements of resistance and instead facilitate the advancement of Project 2025 objectives.",
    "finalAccountabilityTag": "Complicit Enabler",
    "transparencyNote": "This evaluation is based on publicly available information up to April 16, 2025. Some actions or statements may not be captured due to limitations in data availability. Further information could adjust this assessment."
  };
  
  // Format category name for display
  const formatCategoryName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };
  
  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };
  
  // Get icon for category based on score percentage
  const getCategoryIcon = (score, maxPoints) => {
    const percentage = (score / maxPoints) * 100;
    
    if (percentage >= 80) {
      return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
    } else if (percentage >= 60) {
      return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    } else if (percentage >= 40) {
      return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
    } else {
      return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
    }
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 4, 
        backgroundColor: '#1e1e1e',
        border: '1px solid rgba(255, 152, 0, 0.3)',
        borderRadius: '4px',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: '"Special Elite", "Courier New", monospace',
            color: '#ff9800',
          }}
        >
          {data.representative}
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ 
            fontFamily: '"Special Elite", "Courier New", monospace',
            color: '#e0e0e0',
          }}
        >
          {data.position} • {data.state} • {data.party}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
          <ResistanceLevelChip 
            label={data.finalAccountabilityTag}
            level={data.finalAccountabilityTag}
            sx={{ mr: 2 }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <CategoryProgress variant="determinate" value={(data.numericalScore / data.totalPossible) * 100} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e0e0e0' }}>
              {data.numericalScore}/{data.totalPossible}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="body1" 
          paragraph
          sx={{ 
            color: '#e0e0e0',
            fontStyle: 'italic',
            borderLeft: '3px solid #ff9800',
            pl: 2,
            py: 1,
          }}
        >
          {data.strategicIntegritySummary}
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 3 }} />
      
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          fontFamily: '"Special Elite", "Courier New", monospace',
          color: '#ff9800',
          mb: 3
        }}
      >
        Assessment Categories
      </Typography>
      
      {Object.entries(data.categories).map(([key, category]) => (
        <Card 
          key={key} 
          sx={{ 
            mb: 2, 
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
          }}
        >
          <CardHeader
            avatar={getCategoryIcon(category.score, category.maxPoints)}
            title={
              <Typography variant="h6" sx={{ color: '#e0e0e0' }}>
                {formatCategoryName(key)}
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1, color: '#e0e0e0' }}>
                  {category.score}/{category.maxPoints}
                </Typography>
                <IconButton 
                  onClick={() => toggleCategory(key)}
                  sx={{ color: '#e0e0e0' }}
                >
                  {expandedCategories[key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            }
            sx={{ 
              borderBottom: expandedCategories[key] ? '1px solid rgba(255, 152, 0, 0.2)' : 'none',
              '& .MuiCardHeader-content': { overflow: 'hidden' }
            }}
          />
          
          <Collapse in={expandedCategories[key]}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#ff9800', mb: 1 }}>
                  Actions:
                </Typography>
                <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                  {category.actions}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#ff9800', mb: 1 }}>
                  Assessment:
                </Typography>
                <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                  {category.assessment}
                </Typography>
              </Box>
            </CardContent>
          </Collapse>
        </Card>
      ))}
      
      <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 3 }} />
      
      <Box 
        sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.2)', 
          p: 2, 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'flex-start'
        }}
      >
        <HelpIcon sx={{ color: '#ff9800', mr: 1, mt: 0.5 }} />
        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
          {data.transparencyNote}
        </Typography>
      </Box>
    </Paper>
  );
};

export default JohnBarrassoPanel;
