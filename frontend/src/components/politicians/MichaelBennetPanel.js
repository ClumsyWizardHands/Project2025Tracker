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
 * MichaelBennetPanel component displays a detailed assessment of Michael Bennet
 */
const MichaelBennetPanel = () => {
  const theme = useTheme();
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Michael Bennet data
  const data = {
    "evaluationSubject": "U.S. Senator Michael Bennet (D-CO)",
    "evaluationFramework": "Resistance Scoring Intelligence Agent – Instruction Set V4",
    "numericalScore": 63,
    "maximumScore": 100,
    "categoryBreakdown": [
      {
        "category": "Public Statements and Advocacy",
        "score": 18,
        "maxScore": 30,
        "actions": [
          "Senator Bennet has publicly expressed strong opposition to former President Donald Trump's influence on democracy, stating, 'There is not a person in the Senate who's more worried about what Trump is doing to our democracy and our economy than I am'"
        ],
        "assessment": "While his statements are clear in opposing authoritarian tendencies, they lack direct references to Project 2025 or strategic actions to counter such initiative."
      },
      {
        "category": "Legislative Action and Oversight",
        "score": 15,
        "maxScore": 25,
        "actions": [
          "Co-sponsored the Protect the West Act, aiming to invest $60 billion to reduce wildfire risk and protect communities",
          "Introduced the GREEN Appraisals Act to promote energy efficiency in home appraisals"
        ],
        "assessment": "Demonstrates legislative engagement on environmental and housing issues. However, lacks evidence of using committee power or procedural tools to obstruct authoritarian policies."
      },
      {
        "category": "Public and Community Engagement",
        "score": 10,
        "maxScore": 20,
        "actions": [
          "Announced his candidacy for Colorado governor, citing the need to oppose Trump's influence and protect democracy"
        ],
        "assessment": "Engagements are standard and lack adversarial or high-risk elements opposing authoritarian policies."
      },
      {
        "category": "Social Media and Digital Outreach",
        "score": 10,
        "maxScore": 15,
        "actions": [
          "Utilized social media platforms to disseminate information about threats to democracy and to encourage civic participation"
        ],
        "assessment": "Effective use of digital platforms to inform and mobilize constituents, with content that disrupts authoritarian narrative."
      },
      {
        "category": "Consistency and Deep Impact",
        "score": 10,
        "maxScore": 10,
        "actions": [
          "Maintained a consistent record of opposing authoritarian policies and supporting democratic institutions"
        ],
        "assessment": "Exhibits a coherent long-term alignment against authoritarian acceleration."
      }
    ],
    "strategicIntegritySummary": "Senator Michael Bennet demonstrates a consistent commitment to resisting authoritarian policies through public statements and legislative efforts. His recent decision to run for Colorado governor underscores his dedication to opposing authoritarian influences at both state and national levels. However, there is room for increased strategic disruption and direct opposition to initiatives like Project 2025.",
    "finalAccountabilityTag": "Inconsistent Advocate",
    "transparencyNote": "This evaluation is based on publicly available information up to April 16, 2025. Some actions or statements may not be captured due to limitations in data availability. Further information could adjust this assessment."
  };
  
  // Format category name for display
  const formatCategoryName = (category) => {
    return category;
  };
  
  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };
  
  // Get icon for category based on score percentage
  const getCategoryIcon = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    
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
          Michael Bennet
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ 
            fontFamily: '"Special Elite", "Courier New", monospace',
            color: '#e0e0e0',
          }}
        >
          U.S. Senator • Colorado • Democrat
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
          <ResistanceLevelChip 
            label={data.finalAccountabilityTag}
            level={data.finalAccountabilityTag}
            sx={{ mr: 2 }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <CategoryProgress variant="determinate" value={(data.numericalScore / data.maximumScore) * 100} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e0e0e0' }}>
              {data.numericalScore}/{data.maximumScore}
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
      
      {data.categoryBreakdown.map((category) => (
        <Card 
          key={category.category} 
          sx={{ 
            mb: 2, 
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
          }}
        >
          <CardHeader
            avatar={getCategoryIcon(category.score, category.maxScore)}
            title={
              <Typography variant="h6" sx={{ color: '#e0e0e0' }}>
                {formatCategoryName(category.category)}
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1, color: '#e0e0e0' }}>
                  {category.score}/{category.maxScore}
                </Typography>
                <IconButton 
                  onClick={() => toggleCategory(category.category)}
                  sx={{ color: '#e0e0e0' }}
                >
                  {expandedCategories[category.category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            }
            sx={{ 
              borderBottom: expandedCategories[category.category] ? '1px solid rgba(255, 152, 0, 0.2)' : 'none',
              '& .MuiCardHeader-content': { overflow: 'hidden' }
            }}
          />
          
          <Collapse in={expandedCategories[category.category]}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#ff9800', mb: 1 }}>
                  Actions:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {category.actions.map((action, index) => (
                    <li key={index}>
                      <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 0.5 }}>
                        {action}
                      </Typography>
                    </li>
                  ))}
                </ul>
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

export default MichaelBennetPanel;
