import { createTheme } from '@mui/material/styles';

// Noir detective/conspiracy theory theme
const theme = createTheme({
  palette: {
    primary: {
      light: '#4f5b82',
      main: '#1a2a57', // Dark blue
      dark: '#0d1526',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#ffb74d',
      main: '#ff9800', // Amber
      dark: '#c66900',
      contrastText: '#000000',
    },
    error: {
      main: '#b71c1c', // Deep red
      light: '#e57373',
      dark: '#7f0000',
    },
    warning: {
      main: '#ff3d00', // Neon orange
      light: '#ff6e40',
      dark: '#dd2c00',
    },
    info: {
      main: '#00b8d4', // Neon blue
      light: '#18ffff',
      dark: '#0088a3',
    },
    success: {
      main: '#00c853', // Neon green
      light: '#69f0ae',
      dark: '#00a839',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e', // Slightly lighter dark
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    // Detective/typewriter style fonts
    fontFamily: [
      '"Special Elite"', // Typewriter font
      '"Courier New"',
      'monospace',
    ].join(','),
    h1: {
      fontFamily: '"Special Elite", "Courier New", monospace',
      fontSize: '2.5rem',
      fontWeight: 400,
      color: '#e0e0e0',
      letterSpacing: '0.02em',
    },
    h2: {
      fontFamily: '"Special Elite", "Courier New", monospace',
      fontSize: '2rem',
      fontWeight: 400,
      color: '#e0e0e0',
      letterSpacing: '0.02em',
    },
    h3: {
      fontFamily: '"Special Elite", "Courier New", monospace',
      fontSize: '1.75rem',
      fontWeight: 400,
      letterSpacing: '0.02em',
    },
    h4: {
      fontFamily: '"Shadows Into Light", cursive',
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h5: {
      fontFamily: '"Shadows Into Light", cursive',
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h6: {
      fontFamily: '"Shadows Into Light", cursive',
      fontSize: '1.1rem',
      fontWeight: 400,
    },
    subtitle1: {
      fontFamily: '"Special Elite", "Courier New", monospace',
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontFamily: '"Special Elite", "Courier New", monospace',
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    body1: {
      fontFamily: '"Courier New", monospace',
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    body2: {
      fontFamily: '"Courier New", monospace',
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    button: {
      fontFamily: '"Special Elite", "Courier New", monospace',
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 0, // Sharp corners for file/document look
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          position: 'relative',
          borderRadius: 0,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '8px 16px',
          boxShadow: 'none',
          position: 'relative',
          overflow: 'visible',
          textTransform: 'none',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-2px',
            left: '0',
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(255, 152, 0, 0.5)',
          },
          '&:hover': {
            boxShadow: '0 0 8px rgba(255, 152, 0, 0.5)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(to bottom, #1a2a57, #0d1526)',
          '&:hover': {
            background: 'linear-gradient(to bottom, #4f5b82, #1a2a57)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(to bottom, #ff9800, #c66900)',
          '&:hover': {
            background: 'linear-gradient(to bottom, #ffb74d, #ff9800)',
          },
        },
        outlined: {
          borderWidth: '1px',
          borderStyle: 'solid',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          borderRadius: 0,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          backgroundColor: '#1e1e1e',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'8\' height=\'8\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 8 0 L 0 0 0 8\' fill=\'none\' stroke=\'rgba(255, 255, 255, 0.05)\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\'/%3E%3C/svg%3E")',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          backgroundImage: 'linear-gradient(to right, #1a2a57, #0d1526)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Special Elite", "Courier New", monospace',
          borderRadius: 0,
        },
        colorPrimary: {
          background: 'linear-gradient(to right, #1a2a57, #0d1526)',
        },
        colorSecondary: {
          background: 'linear-gradient(to right, #ff9800, #c66900)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Special Elite", "Courier New", monospace',
          fontSize: '1rem',
          textTransform: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: '"Courier New", monospace',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
        head: {
          fontFamily: '"Special Elite", "Courier New", monospace',
          fontWeight: 'bold',
          color: '#ff9800',
        },
      },
    },
  },
});

export default theme;
