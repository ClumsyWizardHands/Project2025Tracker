import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  CardActions,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WarningIcon from '@mui/icons-material/Warning';
import HelpIcon from '@mui/icons-material/Help';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// Helper function to get status color and icon
const getStatusDisplay = (score) => {
  if (!score && score !== 0) {
    return {
      color: 'info',
      icon: <HelpIcon />,
      label: 'INSUFFICIENT DATA',
    };
  }

  if (score >= 70) {
    return {
      color: 'success',
      icon: <ThumbUpIcon />,
      label: 'WHISTLEBLOWER',
    };
  } else if (score >= 40) {
    return {
      color: 'warning',
      icon: null,
      label: 'UNDER SURVEILLANCE',
    };
  } else {
    return {
      color: 'error',
      icon: <WarningIcon />,
      label: 'PERSON OF INTEREST',
    };
  }
};

// Random rotation for polaroid effect
const getRandomRotation = () => {
  const rotations = [-3, -2, -1, 0, 1, 2, 3];
  return rotations[Math.floor(Math.random() * rotations.length)];
};

// Random position for thumbtacks
const getRandomPosition = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const PoliticianCard = ({ politician }) => {
  const { id, name, party, state, position, imageUrl, score } = politician;
  const statusDisplay = getStatusDisplay(score);
  const rotation = getRandomRotation();
  
  // Random positions for thumbtacks
  const thumbtackPositions = {
    topLeft: {
      top: getRandomPosition(5, 15),
      left: getRandomPosition(5, 15),
    },
    topRight: {
      top: getRandomPosition(5, 15),
      right: getRandomPosition(5, 15),
    },
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        border: '1px solid rgba(255, 152, 0, 0.3)',
        borderRadius: 0,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'visible',
        backgroundColor: '#1e1e1e',
        '&:hover': {
          transform: 'rotate(0deg) scale(1.03)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
          zIndex: 10,
        },
      }}
      className="file-folder"
    >
      {/* Thumbtacks */}
      <div 
        className="thumbtack" 
        style={{ 
          top: `${thumbtackPositions.topLeft.top}px`, 
          left: `${thumbtackPositions.topLeft.left}px`,
          zIndex: 2,
        }}
      ></div>
      <div 
        className="thumbtack" 
        style={{ 
          top: `${thumbtackPositions.topRight.top}px`, 
          right: `${thumbtackPositions.topRight.right}px`,
          zIndex: 2,
        }}
      ></div>
      
      {/* Case status */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 2,
          transform: 'rotate(-5deg)',
        }}
      >
        <Chip
          label={statusDisplay.label}
          color={statusDisplay.color}
          icon={statusDisplay.icon}
          sx={{ 
            fontFamily: '"Special Elite", "Courier New", monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.05em',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        />
      </Box>
      
      {/* Case file label */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -10, 
          left: 20, 
          zIndex: 2,
          transform: 'rotate(-5deg)',
        }}
      >
        <div className="case-file-label">CASE FILE</div>
      </Box>
      
      {/* Politician image with polaroid effect */}
      <Box sx={{ position: 'relative', pt: 3, px: 2 }}>
        <Box 
          className="polaroid"
          sx={{ 
            width: '100%',
            position: 'relative',
          }}
        >
          <CardMedia
            component="img"
            height="200"
            image={imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={name}
            sx={{ 
              filter: 'grayscale(80%)',
              border: '1px solid rgba(0, 0, 0, 0.2)',
            }}
          />
          <Typography 
            variant="body2" 
            className="polaroid-caption"
          >
            {name} - {position}
          </Typography>
        </Box>
      </Box>
      
      {/* Coffee stain decoration */}
      <div className="coffee-stain" style={{ top: '50px', right: '-20px', opacity: 0.3 }}></div>
      
      {/* Politician info */}
      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        <Typography 
          variant="h5" 
          component="div" 
          gutterBottom
          className="typewriter-text"
          sx={{ 
            color: '#ff9800',
            letterSpacing: '0.05em',
            position: 'relative',
          }}
        >
          <span className="highlight highlight-yellow">{name}</span>
          <span className="typewriter-cursor"></span>
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            className="typewriter-text"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 0.5,
            }}
          >
            <span className="evidence-tag">AFFILIATION</span>
            <Box component="span" sx={{ ml: 1 }}>
              {party}
            </Box>
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            className="typewriter-text"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 0.5,
            }}
          >
            <span className="evidence-tag">LOCATION</span>
            <Box component="span" sx={{ ml: 1 }}>
              {state}
            </Box>
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            className="typewriter-text"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span className="evidence-tag">ROLE</span>
            <Box component="span" sx={{ ml: 1 }}>
              {position}
            </Box>
          </Typography>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 2 }} />
        
        <Typography 
          variant="body2" 
          className="handwritten-text"
          sx={{ 
            fontStyle: 'italic',
            color: '#b0b0b0',
          }}
        >
          {party === 'Republican' ? 
            'Subject appears to be deeply involved with Project 2025. Further investigation required.' : 
            'Subject has expressed opposition to Project 2025. Continue monitoring for consistency.'}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          component={RouterLink}
          to={`/politicians/${id}`}
          variant="contained"
          color="secondary"
          startIcon={<FolderOpenIcon />}
          fullWidth
          sx={{ 
            fontFamily: '"Special Elite", "Courier New", monospace',
            letterSpacing: '0.05em',
          }}
        >
          VIEW CASE FILE
        </Button>
      </CardActions>
    </Card>
  );
};

export default PoliticianCard;
