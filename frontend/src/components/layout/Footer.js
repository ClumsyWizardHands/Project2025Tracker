import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  useTheme,
} from '@mui/material';

function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Project 2025 Tracker
            </Typography>
            <Typography variant="body2">
              Tracking politicians' positions on Project 2025 to provide transparency and accountability.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link
              component={RouterLink}
              to="/politicians"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Politicians
            </Link>
            <Link
              component={RouterLink}
              to="/statements"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Statements
            </Link>
            <Link
              component={RouterLink}
              to="/scores"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Scores
            </Link>
            <Link
              component={RouterLink}
              to="/about"
              color="inherit"
              display="block"
            >
              About
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Link
              component={RouterLink}
              to="/privacy"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Privacy Policy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Terms of Service
            </Link>
            <Link
              component={RouterLink}
              to="/contact"
              color="inherit"
              display="block"
            >
              Contact Us
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2">
            © {currentYear} Project 2025 Tracker. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Link href="https://twitter.com" target="_blank" rel="noopener" color="inherit">
              Twitter
            </Link>
            <Link href="https://facebook.com" target="_blank" rel="noopener" color="inherit">
              Facebook
            </Link>
            <Link href="https://github.com" target="_blank" rel="noopener" color="inherit">
              GitHub
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
