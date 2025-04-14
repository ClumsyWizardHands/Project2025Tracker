import React, { useState } from 'react';
import { ResponsiveNetwork } from '@nivo/network';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const NetworkGraph = ({ data, title, description }) => {
  const [relationshipType, setRelationshipType] = useState('voting');

  const relationshipTypes = [
    { id: 'voting', name: 'Voting Similarity' },
    { id: 'funding', name: 'Funding Sources' },
    { id: 'committees', name: 'Committee Membership' },
    { id: 'statements', name: 'Statement Similarity' }
  ];

  const handleRelationshipTypeChange = (event) => {
    setRelationshipType(event.target.value);
  };

  // Filter links based on selected relationship type
  const filteredLinks = data.links.filter(link => link.type === relationshipType);

  // Create a new data object with filtered links
  const filteredData = {
    nodes: data.nodes,
    links: filteredLinks
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
          <InputLabel id="relationship-type-select-label">Relationship Type</InputLabel>
          <Select
            labelId="relationship-type-select-label"
            id="relationship-type-select"
            value={relationshipType}
            onChange={handleRelationshipTypeChange}
            label="Relationship Type"
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
            {relationshipTypes.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 600, mt: 3 }}>
        <ResponsiveNetwork
          data={filteredData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          linkDistance={(e) => e.distance}
          centeringStrength={0.3}
          repulsivity={6}
          nodeSize={(n) => n.size}
          activeNodeSize={(n) => n.size * 1.5}
          nodeColor={(n) => n.color}
          nodeBorderWidth={1}
          nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
          linkThickness={(link) => 2 + (link.strength * 2)}
          linkBlendMode="multiply"
          motionConfig="gentle"
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              translateX: -120,
              translateY: -20,
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

export default NetworkGraph;
