import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Divider,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import html2canvas from 'html2canvas';

const ShareableCard = ({ politician, statement, score }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const cardRef = useRef(null);

  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getShareUrl = () => {
    return `${window.location.origin}/politicians/${politician.id}`;
  };

  const getShareText = () => {
    return `Check out ${politician.name}'s Project 2025 opposition score: ${score.value}/100. "${statement.content}" #Project2025Tracker`;
  };

  // Share via Web Share API if available
  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${politician.name} - Project 2025 Tracker`,
        text: getShareText(),
        url: getShareUrl(),
      })
        .then(() => {
          setSnackbarMessage('Shared successfully!');
          setSnackbarOpen(true);
        })
        .catch((error) => {
          console.error('Error sharing:', error);
        });
    } else {
      setSnackbarMessage('Web Share API not supported on this browser');
      setSnackbarOpen(true);
    }
    handleClose();
  };

  // Share to specific platforms
  const handleSocialShare = (platform) => {
    const shareUrl = getShareUrl();
    const shareText = encodeURIComponent(getShareText());
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`${politician.name} - Project 2025 Tracker`)}&body=${shareText}%20${encodeURIComponent(shareUrl)}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
    
    handleClose();
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl())
      .then(() => {
        setSnackbarMessage('Link copied to clipboard!');
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
        setSnackbarMessage('Failed to copy link');
        setSnackbarOpen(true);
      });
    
    handleClose();
  };

  // Download as image
  const handleDownloadImage = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#1e1e1e',
        logging: false,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${politician.name.replace(/\s+/g, '-').toLowerCase()}-project2025.png`;
      link.click();
      
      setSnackbarMessage('Image downloaded successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error generating image:', error);
      setSnackbarMessage('Failed to download image');
      setSnackbarOpen(true);
    }
    
    handleClose();
  };

  // Get party color
  const getPartyColor = (party) => {
    switch (party) {
      case 'Republican':
        return '#bf2132';
      case 'Democrat':
        return '#2c65b1';
      default:
        return '#b5a642';
    }
  };

  // Get score color
  const getScoreColor = (value) => {
    if (value >= 70) return '#4caf50';
    if (value >= 40) return '#ff9800';
    return '#bf2132';
  };

  return (
    <>
      <Card 
        ref={cardRef}
        sx={{ 
          maxWidth: '100%',
          backgroundColor: '#1e1e1e',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: '4px',
          mb: 3,
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'8\' height=\'8\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 8 0 L 0 0 0 8\' fill=\'none\' stroke=\'rgba(255, 255, 255, 0.05)\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\'/%3E%3C/svg%3E")',
            opacity: 0.5,
            pointerEvents: 'none',
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            p: 2
          }}
        >
          <Box>
            <Typography 
              variant="h5" 
              component="div"
              sx={{ 
                fontFamily: '"Special Elite", "Courier New", monospace',
                color: '#ff9800',
                mb: 0.5
              }}
            >
              {politician.name}
            </Typography>
            <Box 
              sx={{ 
                display: 'inline-block',
                backgroundColor: `${getPartyColor(politician.party)}20`,
                color: getPartyColor(politician.party),
                border: `1px solid ${getPartyColor(politician.party)}`,
                borderRadius: '4px',
                px: 1,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                mb: 1
              }}
            >
              {politician.party}
            </Box>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ color: '#e0e0e0', mb: 1 }}
            >
              {politician.position}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2a2a2a',
              borderRadius: '50%',
              width: 80,
              height: 80,
              border: `3px solid ${getScoreColor(score.value)}`,
              boxShadow: `0 0 10px ${getScoreColor(score.value)}40`
            }}
          >
            <Typography 
              variant="h4" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: getScoreColor(score.value)
              }}
            >
              {score.value}
            </Typography>
            <Typography 
              variant="caption" 
              component="div"
              sx={{ 
                fontSize: '0.6rem',
                color: '#e0e0e0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Opposition
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)' }} />
        
        <CardContent>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#e0e0e0',
              fontStyle: 'italic',
              mb: 2,
              position: 'relative',
              pl: 2,
              '&::before': {
                content: '"""',
                position: 'absolute',
                left: 0,
                top: 0,
                color: '#ff9800',
                fontSize: '1.5rem',
                fontFamily: 'Georgia, serif',
                lineHeight: 1
              }
            }}
          >
            {statement.content}
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#9e9e9e',
                fontSize: '0.7rem'
              }}
            >
              {new Date(statement.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#9e9e9e',
                fontSize: '0.7rem'
              }}
            >
              Source: {statement.source}
            </Typography>
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#9e9e9e',
              fontSize: '0.7rem'
            }}
          >
            project2025tracker.org
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleShareClick}
            size="small"
            sx={{ 
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              color: '#ff9800',
              borderColor: 'rgba(255, 152, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.3)',
              }
            }}
          >
            Share
          </Button>
        </CardActions>
      </Card>
      
      {/* Share Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        {navigator.share && (
          <MenuItem onClick={handleNativeShare}>
            <ListItemIcon sx={{ color: '#ff9800' }}>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Share" 
              primaryTypographyProps={{ 
                sx: { color: '#e0e0e0' } 
              }}
            />
          </MenuItem>
        )}
        <MenuItem onClick={() => handleSocialShare('facebook')}>
          <ListItemIcon sx={{ color: '#1877f2' }}>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Facebook" 
            primaryTypographyProps={{ 
              sx: { color: '#e0e0e0' } 
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare('twitter')}>
          <ListItemIcon sx={{ color: '#1da1f2' }}>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Twitter" 
            primaryTypographyProps={{ 
              sx: { color: '#e0e0e0' } 
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare('linkedin')}>
          <ListItemIcon sx={{ color: '#0077b5' }}>
            <LinkedInIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="LinkedIn" 
            primaryTypographyProps={{ 
              sx: { color: '#e0e0e0' } 
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare('whatsapp')}>
          <ListItemIcon sx={{ color: '#25d366' }}>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="WhatsApp" 
            primaryTypographyProps={{ 
              sx: { color: '#e0e0e0' } 
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare('email')}>
          <ListItemIcon sx={{ color: '#ff9800' }}>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Email" 
            primaryTypographyProps={{ 
              sx: { color: '#e0e0e0' } 
            }}
          />
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 1 }} />
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon sx={{ color: '#ff9800' }}>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Copy Link" 
            primaryTypographyProps={{ 
              sx: { color: '#e0e0e0' } 
            }}
          />
        </MenuItem>
        <MenuItem onClick={handleDownloadImage}>
          <ListItemIcon sx={{ color: '#ff9800' }}>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Download Image" 
            primaryTypographyProps={{ 
              sx: { color: '#e0e0e0' } 
            }}
          />
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            color: '#ff9800',
            border: '1px solid rgba(255, 152, 0, 0.5)',
            '& .MuiAlert-icon': {
              color: '#ff9800'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareableCard;
