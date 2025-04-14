import React, { useState } from 'react';
import { ResponsiveChoropleth } from '@nivo/geo';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import usStatesGeoData from './usStatesGeoData';

const GeographicHeatMap = ({ data, title, description }) => {
  const [metric, setMetric] = useState('oppositionScore');

  const metrics = [
    { id: 'oppositionScore', name: 'Opposition Score' },
    { id: 'statementCount', name: 'Statement Count' },
    { id: 'politicianCount', name: 'Politician Count' }
  ];

  const handleMetricChange = (event) => {
    setMetric(event.target.value);
  };

  // Format data for the choropleth map
  const formattedData = data.map(item => ({
    id: item.stateCode,
    value: item[metric],
    stateName: item.stateName,
    politicianCount: item.politicianCount,
    statementCount: item.statementCount,
    oppositionScore: item.oppositionScore
  }));

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
          <InputLabel id="metric-select-label">Metric</InputLabel>
          <Select
            labelId="metric-select-label"
            id="metric-select"
            value={metric}
            onChange={handleMetricChange}
            label="Metric"
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
            {metrics.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 500, mt: 3 }}>
        <ResponsiveChoropleth
          data={formattedData}
          features={usStatesGeoData.features}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          colors="blues"
          domain={[0, 100]}
          unknownColor="#666666"
          label="properties.name"
          valueFormat=".2f"
          projectionScale={1000}
          projectionTranslation={[0.5, 0.5]}
          projectionRotation={[0, 0, 0]}
          enableGraticule={false}
          graticuleLineColor="#dddddd"
          borderWidth={0.5}
          borderColor="#152538"
          legends={[
            {
              anchor: 'bottom-left',
              direction: 'column',
              justify: true,
              translateX: 20,
              translateY: -20,
              itemsSpacing: 0,
              itemWidth: 94,
              itemHeight: 18,
              itemDirection: 'left-to-right',
              itemTextColor: '#e0e0e0',
              itemOpacity: 0.85,
              symbolSize: 18,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: '#ff9800',
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          tooltip={({ feature }) => {
            const matchingData = formattedData.find(item => item.id === feature.id);
            if (!matchingData) return null;
            
            return (
              <Box
                sx={{
                  padding: '12px',
                  background: '#1e1e1e',
                  border: '1px solid #ff9800',
                  borderRadius: '4px',
                  color: '#e0e0e0',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
                  {matchingData.stateName}
                </Typography>
                <Typography variant="body2">
                  Opposition Score: {matchingData.oppositionScore.toFixed(1)}
                </Typography>
                <Typography variant="body2">
                  Politicians: {matchingData.politicianCount}
                </Typography>
                <Typography variant="body2">
                  Statements: {matchingData.statementCount}
                </Typography>
              </Box>
            );
          }}
          theme={{
            background: 'transparent',
            textColor: '#e0e0e0',
            fontSize: 12,
            axis: {
              domain: {
                line: {
                  stroke: '#777777',
                  strokeWidth: 1
                }
              },
              ticks: {
                line: {
                  stroke: '#777777',
                  strokeWidth: 1
                }
              }
            },
            grid: {
              line: {
                stroke: '#444444',
                strokeWidth: 1
              }
            },
            legends: {
              text: {
                fill: '#e0e0e0'
              }
            },
            tooltip: {
              container: {
                background: '#1e1e1e',
                color: '#e0e0e0',
                fontSize: 12,
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default GeographicHeatMap;
