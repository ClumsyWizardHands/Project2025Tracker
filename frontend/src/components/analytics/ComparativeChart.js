import React, { useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField, Chip } from '@mui/material';

const ComparativeChart = ({ data, politicians, title, description }) => {
  const [metric, setMetric] = useState('oppositionScore');
  const [selectedPoliticians, setSelectedPoliticians] = useState([]);

  const metrics = [
    { id: 'oppositionScore', name: 'Opposition Score' },
    { id: 'statementCount', name: 'Statement Count' },
    { id: 'mediaAppearances', name: 'Media Appearances' },
    { id: 'socialMediaActivity', name: 'Social Media Activity' }
  ];

  const handleMetricChange = (event) => {
    setMetric(event.target.value);
  };

  const handlePoliticianChange = (event, newValue) => {
    setSelectedPoliticians(newValue);
  };

  // Filter data based on selected politicians and metric
  const filteredData = data
    .filter(item => selectedPoliticians.length === 0 || selectedPoliticians.some(p => p.id === item.politicianId))
    .map(item => ({
      politician: item.name,
      party: item.party,
      [metric]: item[metric],
      color: item.party === 'Republican' ? '#bf2132' : item.party === 'Democrat' ? '#2c65b1' : '#b5a642'
    }))
    .sort((a, b) => b[metric] - a[metric]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ minWidth: '250px' }}>
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
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
          <Autocomplete
            multiple
            id="politician-select"
            options={politicians}
            getOptionLabel={(option) => option.name}
            value={selectedPoliticians}
            onChange={handlePoliticianChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Filter Politicians"
                placeholder="Select politicians"
                size="small"
                sx={{
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: '#e0e0e0',
                    '& fieldset': {
                      borderColor: 'rgba(255, 152, 0, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff9800',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff9800',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#e0e0e0',
                  },
                  '& .MuiInputBase-input': {
                    color: '#e0e0e0',
                  }
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.id}
                  label={option.name}
                  {...getTagProps({ index })}
                  sx={{
                    backgroundColor: option.party === 'Republican' ? 'rgba(191, 33, 50, 0.2)' : 
                                    option.party === 'Democrat' ? 'rgba(44, 101, 177, 0.2)' : 
                                    'rgba(181, 166, 66, 0.2)',
                    color: '#e0e0e0',
                    borderColor: option.party === 'Republican' ? '#bf2132' : 
                                option.party === 'Democrat' ? '#2c65b1' : 
                                '#b5a642',
                  }}
                />
              ))
            }
            sx={{
              '& .MuiAutocomplete-tag': {
                margin: '2px',
              }
            }}
          />
        </Box>
      </Box>

      <Box sx={{ height: 500, mt: 3 }}>
        <ResponsiveBar
          data={filteredData}
          keys={[metric]}
          indexBy="politician"
          margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={({ data }) => data.color}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Politician',
            legendPosition: 'middle',
            legendOffset: 80
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: metrics.find(m => m.id === metric)?.name || metric,
            legendPosition: 'middle',
            legendOffset: -50
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          role="application"
          ariaLabel="Politician comparison chart"
          barAriaLabel={e => `${e.id}: ${e.formattedValue} for ${e.indexValue}`}
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
                },
                text: {
                  fill: '#e0e0e0'
                }
              },
              legend: {
                text: {
                  fill: '#e0e0e0'
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

export default ComparativeChart;
