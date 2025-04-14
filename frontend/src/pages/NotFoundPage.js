import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function NotFoundPage() {
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 8,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 100,
            color: theme.palette.primary.main,
            mb: 4,
          }}
        />
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '3rem', md: '4rem' },
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mb: 2 }}
        >
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            size="large"
          >
            Go to Homepage
          </Button>
          <Button
            component={RouterLink}
            to="/politicians"
            variant="outlined"
            color="primary"
            size="large"
          >
            View Politicians
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default NotFoundPage;
