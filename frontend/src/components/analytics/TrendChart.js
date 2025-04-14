import React, { useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import TimelineIcon from '@mui/icons-material/Timeline';

const TrendChart = ({ data, title, description }) => {
  const [metric, setMetric] = useState('oppositionScore');
  const [chartType, setChartType] = useState('line');

  const metrics = [
    { id: 'oppositionScore', name: 'Opposition Score' },
    { id: 'statementCount', name: 'Statement Count' },
    { id: 'mediaAppearances', name: 'Media Appearances' },
    { id: 'socialMediaActivity', name: 'Social Media Activity' }
  ];

  const handleMetricChange = (event) => {
    setMetric(event.target.value);
  };

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Filter data based on selected metric
  const filteredData = data.filter(series => series.id.includes(metric));

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
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: '#e0e0e0',
                borderColor: 'rgba(255, 152, 0, 0.5)',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  color: '#ff9800',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                }
              }
            }}
          >
            <ToggleButton value="line" aria-label="line chart">
              <TimelineIcon />
            </ToggleButton>
            <ToggleButton value="bar" aria-label="bar chart">
              <CalendarViewWeekIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ height: 400, mt: 3 }}>
        <ResponsiveLine
          data={filteredData}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'time', format: '%Y-%m-%d', useUTC: false, precision: 'day' }}
          xFormat="time:%Y-%m-%d"
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false
          }}
          curve={chartType === 'line' ? 'monotoneX' : 'stepAfter'}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            format: '%b %d',
            tickValues: 'every 2 months',
            legend: 'Date',
            legendOffset: 36,
            legendPosition: 'middle',
            tickRotation: -45
          }}
          axisLeft={{
            legend: metrics.find(m => m.id === metric)?.name || metric,
            legendOffset: -40,
            legendPosition: 'middle'
          }}
          enableGridX={false}
          enableGridY={true}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          enableArea={chartType === 'line'}
          areaOpacity={0.15}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
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

export default TrendChart;
