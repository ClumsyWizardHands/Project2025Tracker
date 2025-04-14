import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoIcon from '@mui/icons-material/Info';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LogoutIcon from '@mui/icons-material/Logout';
import FolderIcon from '@mui/icons-material/Folder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useAuth } from '../../contexts/AuthContext';

const pages = [
  { name: 'Persons of Interest', path: '/politicians', icon: <PersonSearchIcon /> },
  { name: 'Evidence Files', path: '/statements', icon: <DescriptionIcon /> },
  { name: 'Analysis Reports', path: '/scores', icon: <AssessmentIcon /> },
  { name: 'Case Background', path: '/about', icon: <InfoIcon /> },
];

const analyticsPages = [
  { name: 'Interactive Dashboard', path: '/analytics/dashboard', icon: <DashboardIcon /> },
  { name: 'Network Analysis', path: '/analytics/network', icon: <NetworkCheckIcon /> },
  { name: 'Predictive Analytics', path: '/analytics/predictive', icon: <TimelineIcon />, roles: ['researcher', 'admin'] },
];

const userActions = [
  { name: 'Submit Evidence', path: '/submit-evidence', icon: <AddCircleOutlineIcon />, public: true },
  { name: 'Moderation Queue', path: '/moderation-queue', icon: <FactCheckIcon />, roles: ['researcher', 'admin'] }
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { currentUser, logout, hasRole } = useAuth();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleCloseUserMenu();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 2, backgroundColor: '#1e1e1e' }}>
      <Box display="flex" justifyContent="flex-end" px={1}>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#e0e0e0' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography 
        variant="h6" 
        component="div" 
        align="center" 
        className="typewriter-text"
        sx={{ 
          mb: 2,
          color: '#ffffff',
        }}
      >
        FIGHT AGAINST THE QUIET COUP
      </Typography>
      <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', mb: 2 }} />
      <List>
        {pages.map((page) => (
          <ListItem 
            button 
            key={page.name} 
            component={RouterLink} 
            to={page.path}
            onClick={handleDrawerToggle}
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
              },
              mb: 1,
              backgroundColor: page.name === 'Case Background' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
            }}
          >
            <ListItemIcon sx={{ color: '#ff9800' }}>
              {page.icon}
            </ListItemIcon>
            <ListItemText 
              primary={page.name} 
              primaryTypographyProps={{ 
                fontFamily: '"Special Elite", "Courier New", monospace',
                fontSize: '0.9rem',
                letterSpacing: '0.05em',
                color: page.name === 'Case Background' ? '#ff9800' : 'inherit',
                fontWeight: page.name === 'Case Background' ? 'bold' : 'normal',
                sx: page.name === 'Case Background' ? {
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                } : {}
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 2 }} />
      <Typography 
        variant="subtitle2" 
        component="div" 
        sx={{ 
          px: 2,
          mb: 1,
          color: '#ffffff',
          fontFamily: '"Special Elite", "Courier New", monospace',
        }}
      >
        INTELLIGENCE ANALYTICS
      </Typography>
      <List>
        {analyticsPages.map((page) => {
          // Check if page should be shown based on roles
          if (!page.roles || (page.roles && page.roles.some(role => hasRole(role)))) {
            return (
              <ListItem 
                button 
                key={page.name} 
                component={RouterLink} 
                to={page.path}
                onClick={handleDrawerToggle}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  },
                  mb: 1,
                }}
              >
                <ListItemIcon sx={{ color: '#ff9800' }}>
                  {page.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={page.name} 
                  primaryTypographyProps={{ 
                    fontFamily: '"Special Elite", "Courier New", monospace',
                    fontSize: '0.9rem',
                    letterSpacing: '0.05em',
                  }}
                />
              </ListItem>
            );
          }
          return null;
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 2 }} />
      <List>
        {/* User action links */}
        {userActions.map((action) => {
              // Check if action should be shown
              if (action.public || (action.roles && action.roles.some(role => hasRole(role)))) {
            return (
              <ListItem 
                button 
                key={action.name} 
                component={RouterLink} 
                to={action.path}
                onClick={handleDrawerToggle}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  },
                  mb: 1,
                }}
              >
                <ListItemIcon sx={{ color: '#ff9800' }}>
                  {action.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={action.name} 
                  primaryTypographyProps={{ 
                    fontFamily: '"Special Elite", "Courier New", monospace',
                    fontSize: '0.9rem',
                    letterSpacing: '0.05em',
                  }}
                />
              </ListItem>
            );
          }
          return null;
        })}
        
        {currentUser ? (
          <>
            <ListItem 
              button 
              component={RouterLink} 
              to="/profile"
              onClick={handleDrawerToggle}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                },
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ color: '#ff9800' }}>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Investigator Profile" 
                primaryTypographyProps={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                }}
              />
            </ListItem>
            <ListItem 
              button 
              onClick={() => {
                handleLogout();
                handleDrawerToggle();
              }}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                },
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ color: '#ff9800' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Close Session" 
                primaryTypographyProps={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                }}
              />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              button 
              component={RouterLink} 
              to="/login"
              onClick={handleDrawerToggle}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                },
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ color: '#ff9800' }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Secure Login" 
                primaryTypographyProps={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                }}
              />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink} 
              to="/register"
              onClick={handleDrawerToggle}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                },
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ color: '#ff9800' }}>
                <HowToRegIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Join Investigation" 
                primaryTypographyProps={{ 
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo/Title */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontFamily: '"Special Elite", "Courier New", monospace',
              fontWeight: 400,
              letterSpacing: '0.05rem',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
              lineHeight: 1.2,
              flexShrink: 0,
              maxWidth: { xs: '180px', sm: '250px', md: '300px' },
            }}
          >
            FIGHT AGAINST THE QUIET COUP
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                startIcon={page.icon}
                sx={{ 
                  my: 2, 
                  color: page.name === 'Case Background' ? '#ff9800' : 'white', 
                  display: 'block',
                  mx: 1,
                  fontFamily: '"Special Elite", "Courier New", monospace',
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  fontWeight: page.name === 'Case Background' ? 'bold' : 'normal',
                  ...(page.name === 'Case Background' ? {
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                  } : {}),
                  '&:hover': {
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  }
                }}
              >
                {page.name}
              </Button>
            ))}
            
            {/* Analytics navigation */}
            {analyticsPages.map((page) => {
              // Check if page should be shown based on roles
              if (!page.roles || (page.roles && page.roles.some(role => hasRole(role)))) {
                return (
                  <Button
                    key={page.name}
                    component={RouterLink}
                    to={page.path}
                    startIcon={page.icon}
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 1,
                      fontFamily: '"Special Elite", "Courier New", monospace',
                      fontSize: '0.8rem',
                      letterSpacing: '0.05em',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                      }
                    }}
                  >
                    {page.name}
                  </Button>
                );
              }
              return null;
            })}
            
            {/* User action buttons */}
            {userActions.map((action) => {
              // Check if action should be shown
              if (action.public || (action.roles && action.roles.some(role => hasRole(role)))) {
                return (
                  <Button
                    key={action.name}
                    component={RouterLink}
                    to={action.path}
                    startIcon={action.icon}
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 1,
                      fontFamily: '"Special Elite", "Courier New", monospace',
                      fontSize: '0.8rem',
                      letterSpacing: '0.05em',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                      }
                    }}
                  >
                    {action.name}
                  </Button>
                );
              }
              return null;
            })}
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {currentUser ? (
              <>
                <Button
                  onClick={handleOpenUserMenu}
                  startIcon={<FolderIcon />}
                  sx={{ 
                    color: 'white',
                    fontFamily: '"Special Elite", "Courier New", monospace',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  INVESTIGATOR
                </Button>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    sx: {
                      backgroundColor: '#1e1e1e',
                      border: '1px solid rgba(255, 152, 0, 0.3)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                    }
                  }}
                >
                  <MenuItem 
                    component={RouterLink} 
                    to="/profile" 
                    onClick={handleCloseUserMenu}
                    sx={{ 
                      fontFamily: '"Special Elite", "Courier New", monospace',
                      fontSize: '0.9rem',
                      letterSpacing: '0.05em',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#ff9800' }}>
                      <FolderIcon />
                    </ListItemIcon>
                    Investigator Profile
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      fontFamily: '"Special Elite", "Courier New", monospace',
                      fontSize: '0.9rem',
                      letterSpacing: '0.05em',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#ff9800' }}>
                      <LogoutIcon />
                    </ListItemIcon>
                    Close Session
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ 
                    color: 'white',
                    fontFamily: '"Special Elite", "Courier New", monospace',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    }
                  }}
                >
                  SECURE LOGIN
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  startIcon={<HowToRegIcon />}
                  sx={{ 
                    color: 'white',
                    borderColor: 'rgba(255, 152, 0, 0.5)',
                    ml: 1,
                    fontFamily: '"Special Elite", "Courier New", monospace',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    '&:hover': {
                      borderColor: '#ff9800',
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    }
                  }}
                >
                  JOIN INVESTIGATION
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'8\' height=\'8\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 8 0 L 0 0 0 8\' fill=\'none\' stroke=\'rgba(255, 255, 255, 0.05)\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\'/%3E%3C/svg%3E")',
          }
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;
