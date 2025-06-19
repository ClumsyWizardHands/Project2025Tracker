import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  Paper, 
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import GavelIcon from '@mui/icons-material/Gavel';
import GroupsIcon from '@mui/icons-material/Groups';
import ShareIcon from '@mui/icons-material/Share';
import VerifiedIcon from '@mui/icons-material/Verified';

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
    padding: theme.spacing(2),
    height: 'auto',
    '& .MuiChip-label': {
      fontSize: '1.2rem',
      padding: theme.spacing(1),
    }
  };
});

/**
 * JuanVargasPanel component displays a detailed assessment of Juan Vargas
 */
const JuanVargasPanel = () => {
  const theme = useTheme();
  
  // Juan Vargas data
  const data = {
    "representative": "Juan Vargas",
    "district": "CA-52",
    "numericalScore": 71,
    "totalPossible": 100,
    "categories": {
      "publicStatementsAndAdvocacy": {
        "score": 18,
        "maxPoints": 30,
        "actions": "Rep. Vargas has publicly criticized Project 2025, labeling it as detrimental to essential programs like Medicaid and SNA. He has also voted against Republican budget plans that he perceives as harmful to social program.",
        "assessment": "While his statements are clear and oppositional to authoritarian-leaning policies, they are primarily rhetorical without accompanying strategic actions or resource mobilization."
      },
      "legislativeActionAndOversight": {
        "score": 16,
        "maxPoints": 25,
        "actions": "Co-sponsored the American Dream and Promise Act of 2025, aiming to provide a pathway to citizenship for Dreamers and other immigrants. Introduced legislation to update federal credit union board meeting requirements.",
        "assessment": "Demonstrates legislative engagement on social justice issues. However, lacks evidence of using committee power or procedural tools to obstruct authoritarian policies."
      },
      "publicAndCommunityEngagement": {
        "score": 12,
        "maxPoints": 20,
        "actions": "Advocated for community projects, such as flood mitigation in San Diego's Southcrest community. Engaged with constituents through recognition of community advocates.",
        "assessment": "Active in community engagement, but lacks evidence of high-risk or adversarial appearances opposing authoritarian policies."
      },
      "socialMediaAndDigitalOutreach": {
        "score": 10,
        "maxPoints": 15,
        "actions": "Utilized platforms like Facebook and X to criticize Project 2025 and related policies.",
        "assessment": "Effective in using social media to inform and mobilize constituents against authoritarian-leaning policies."
      },
      "consistencyAndDeepImpact": {
        "score": 10,
        "maxPoints": 10,
        "actions": "Consistently opposed policies perceived as authoritarian. Maintained a steady record of supporting social justice and immigrant rights.",
        "assessment": "Demonstrates a coherent long-term alignment against authoritarian acceleration."
      }
    },
    "strategicIntegritySummary": "Rep. Juan Vargas exhibits a consistent oppositional stance against authoritarian-leaning policies, particularly those associated with Project 2025. His legislative efforts and public statements align with pro-democracy values. However, there is a lack of evidence showing the use of strategic legislative tools or high-risk public engagements to actively disrupt authoritarian advancements.",
    "finalAccountabilityTag": "Active Resistor",
    "transparencyNote": "This evaluation is based on publicly available information up to April 16, 2025. Some actions or statements may not be captured due to limitations in data availability. Further information could adjust this assessment."
  };
  
  // Calculate percentages for each category
  const categoryPercentages = {
    publicStatementsAndAdvocacy: (data.categories.publicStatementsAndAdvocacy.score / data.categories.publicStatementsAndAdvocacy.maxPoints) * 100,
    legislativeActionAndOversight: (data.categories.legislativeActionAndOversight.score / data.categories.legislativeActionAndOversight.maxPoints) * 100,
    publicAndCommunityEngagement: (data.categories.publicAndCommunityEngagement.score / data.categories.publicAndCommunityEngagement.maxPoints) * 100,
    socialMediaAndDigitalOutreach: (data.categories.socialMediaAndDigitalOutreach.score / data.categories.socialMediaAndDigitalOutreach.maxPoints) * 100,
    consistencyAndDeepImpact: (data.categories.consistencyAndDeepImpact.score / data.categories.consistencyAndDeepImpact.maxPoints) * 100
  };
  
  // Get icon for each category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'publicStatementsAndAdvocacy':
        return <InfoIcon />;
      case 'legislativeActionAndOversight':
        return <GavelIcon />;
      case 'publicAndCommunityEngagement':
        return <GroupsIcon />;
      case 'socialMediaAndDigitalOutreach':
        return <ShareIcon />;
      case 'consistencyAndDeepImpact':
        return <VerifiedIcon />;
      default:
        return <StarIcon />;
    }
  };
  
  // Format category name
  const formatCategoryName = (category) => {
    switch (category) {
      case 'publicStatementsAndAdvocacy':
        return 'Public Statements & Advocacy';
      case 'legislativeActionAndOversight':
        return 'Legislative Action & Oversight';
      case 'publicAndCommunityEngagement':
        return 'Public & Community Engagement';
      case 'socialMediaAndDigitalOutreach':
        return 'Social Media & Digital Outreach';
      case 'consistencyAndDeepImpact':
        return 'Consistency & Deep Impact';
      default:
        return category;
    }
  };
  
  return (
    <Card sx={{ mb: 4, overflow: 'hidden' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h1" gutterBottom>
                {data.representative}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {data.district} • Democratic
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <ResistanceLevelChip 
                label={data.finalAccountabilityTag}
                level={data.finalAccountabilityTag}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Overall Score */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Overall Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <CategoryProgress variant="determinate" value={(data.numericalScore / data.totalPossible) * 100} />
            </Box>
            <Typography variant="h5" component="div">
              {data.numericalScore}/{data.totalPossible}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Category Scores */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Category Scores
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(data.categories).map(([category, categoryData]) => (
              <Grid item xs={12} key={category}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1 }}>
                      {getCategoryIcon(category)}
                    </Box>
                    <Typography variant="h6">
                      {formatCategoryName(category)} ({categoryData.maxPoints}%)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <CategoryProgress variant="determinate" value={categoryPercentages[category]} />
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {categoryData.score}/{categoryData.maxPoints}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    <strong>Actions:</strong> {categoryData.actions}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary">
                    <strong>Assessment:</strong> {categoryData.assessment}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Strategic Integrity Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Strategic Integrity Summary
          </Typography>
          <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
            <Typography variant="body1">
              {data.strategicIntegritySummary}
            </Typography>
          </Paper>
        </Box>
        
        {/* Transparency Note */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            {data.transparencyNote}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JuanVargasPanel;
