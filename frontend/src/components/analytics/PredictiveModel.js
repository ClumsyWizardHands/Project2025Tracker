import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';

const PredictiveModel = ({ data, title, description }) => {
  const [predictionType, setPredictionType] = useState('voting');

  const predictionTypes = [
    { id: 'voting', name: 'Voting Behavior' },
    { id: 'statements', name: 'Public Statements' },
    { id: 'silence', name: 'Silence Probability' }
  ];

  const handlePredictionTypeChange = (event) => {
    setPredictionType(event.target.value);
  };

  // Filter data based on selected prediction type
  const filteredData = data.filter(item => item.predictionType === predictionType);

  // Get risk level color
  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high':
        return '#bf2132';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  // Get risk level icon
  const getRiskLevelIcon = (level) => {
    switch (level) {
      case 'high':
        return <WarningIcon fontSize="small" />;
      case 'medium':
        return <InfoIcon fontSize="small" />;
      case 'low':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <HelpIcon fontSize="small" />;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: '"Special Elite", "Courier New", monospace',
              color: '#ff9800',
              mb: 1
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2 }}>
            {description}
          </Typography>
        </Box>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="prediction-type-select-label">Prediction Type</InputLabel>
          <Select
            labelId="prediction-type-select-label"
            id="prediction-type-select"
            value={predictionType}
            onChange={handlePredictionTypeChange}
            label="Prediction Type"
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#e0e0e0',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 152, 0, 0.5)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff9800',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff9800',
              }
            }}
          >
            {predictionTypes.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="predictive model table">
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  backgroundColor: '#2a2a2a', 
                  color: '#e0e0e0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                Politician
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#2a2a2a', 
                  color: '#e0e0e0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                Party
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#2a2a2a', 
                  color: '#e0e0e0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                Prediction
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#2a2a2a', 
                  color: '#e0e0e0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                Confidence
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#2a2a2a', 
                  color: '#e0e0e0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                Risk Level
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#2a2a2a', 
                  color: '#e0e0e0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                Key Factors
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#2a2a2a', 
                  color: '#e0e0e0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                Recommended Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow
                key={row.id}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
                  '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.05)' },
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ 
                    color: '#e0e0e0',
                    fontWeight: 'bold',
                    borderBottom: 'none'
                  }}
                >
                  {row.name}
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: '#e0e0e0',
                    borderBottom: 'none'
                  }}
                >
                  <Chip 
                    label={row.party} 
                    size="small"
                    sx={{
                      backgroundColor: row.party === 'Republican' ? 'rgba(191, 33, 50, 0.2)' : 
                                      row.party === 'Democrat' ? 'rgba(44, 101, 177, 0.2)' : 
                                      'rgba(181, 166, 66, 0.2)',
                      color: '#e0e0e0',
                      borderColor: row.party === 'Republican' ? '#bf2132' : 
                                  row.party === 'Democrat' ? '#2c65b1' : 
                                  '#b5a642',
                      border: '1px solid'
                    }}
                  />
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: '#e0e0e0',
                    borderBottom: 'none'
                  }}
                >
                  {row.prediction}
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: '#e0e0e0',
                    borderBottom: 'none'
                  }}
                >
                  {row.confidence}%
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: '#e0e0e0',
                    borderBottom: 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getRiskLevelIcon(row.riskLevel)}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getRiskLevelColor(row.riskLevel),
                        textTransform: 'capitalize',
                        fontWeight: 'bold'
                      }}
                    >
                      {row.riskLevel}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: '#e0e0e0',
                    borderBottom: 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {row.keyFactors.map((factor, index) => (
                      <Tooltip key={index} title={factor.description} arrow placement="top">
                        <Chip 
                          label={factor.name} 
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            color: '#e0e0e0',
                            border: '1px solid rgba(255, 152, 0, 0.3)'
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: '#e0e0e0',
                    borderBottom: 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {row.recommendedAction}
                    </Typography>
                    <Tooltip title={row.actionDetails} arrow placement="top">
                      <IconButton size="small" sx={{ color: '#ff9800', ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PredictiveModel;
