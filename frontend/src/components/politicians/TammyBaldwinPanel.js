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
 * TammyBaldwinPanel component displays a detailed assessment of Tammy Baldwin
 */
const TammyBaldwinPanel = () => {
  const theme = useTheme();
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Tammy Baldwin data
  const data = {
    "representative": "Tammy Baldwin",
    "state": "Wisconsin",
    "position": "U.S. Senator",
    "numericalScore": 78,
    "totalPossible": 100,
    "categories": {
      "publicStatementsAndAdvocacy": {
        "score": 22,
        "maxPoints": 30,
        "actions": "Senator Baldwin has consistently voiced opposition to policies associated with Project 2025, emphasizing the protection of healthcare rights and LGBTQ+ communities. She has participated in public forums discussing the dangers of authoritarian governance.",
        "assessment": "Her statements are impactful and align with strategic resistance, though there is limited evidence of direct resource mobilization linked to these statements."
      },
      "legislativeActionAndOversight": {
        "score": 20,
        "maxPoints": 25,
        "actions": "Co-sponsored legislation aimed at safeguarding voting rights and healthcare access. Utilized her committee positions to scrutinize appointments and policies that may facilitate authoritarian practices.",
        "assessment": "Demonstrates proactive legislative engagement, with some use of procedural tools to delay or amend concerning legislation."
      },
      "publicAndCommunityEngagement": {
        "score": 15,
        "maxPoints": 20,
        "actions": "Engaged with constituents through town halls focused on resisting authoritarian policies. Participated in community events promoting democratic values.",
        "assessment": "Active in community engagement with a focus on mobilizing opposition to authoritarian trends."
      },
      "socialMediaAndDigitalOutreach": {
        "score": 12,
        "maxPoints": 15,
        "actions": "Utilized social media platforms to disseminate information about threats to democracy and to encourage civic participation.",
        "assessment": "Effective use of digital platforms to inform and mobilize constituents, with content that disrupts authoritarian narratives."
      },
      "consistencyAndDeepImpact": {
        "score": 9,
        "maxPoints": 10,
        "actions": "Maintained a consistent record of opposing authoritarian policies and supporting democratic institutions.",
        "assessment": "Exhibits a coherent long-term alignment against authoritarian acceleration."
      }
    },
    "strategicIntegritySummary": "Senator Tammy Baldwin demonstrates a strong and consistent commitment to resisting authoritarian policies. Her legislative actions, public advocacy, and community engagement collectively contribute to her effectiveness as a defender of democratic values. While there is room for increased strategic disruption, her current efforts significantly contribute to obstructing authoritarian advancements.",
    "finalAccountabilityTag": "Active Resistor",
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
          {data.position} • {data.state}
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

export default TammyBaldwinPanel;
