import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert, 
  Divider,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Link,
  Collapse
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from '../contexts/AuthContext';
import JuanVargasCompactPanel from '../components/politicians/JuanVargasCompactPanel';
import TammyBaldwinCompactPanel from '../components/politicians/TammyBaldwinCompactPanel';
import JohnBarrassoCompactPanel from '../components/politicians/JohnBarrassoCompactPanel';
import MichaelBennetCompactPanel from '../components/politicians/MichaelBennetCompactPanel';

const StatementsPage = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statements, setStatements] = useState([]);
  
  // State for expanded assessments
  const [expandedAssessments, setExpandedAssessments] = useState({});
  
  // Toggle assessment expansion
  const toggleAssessment = (politicianId) => {
    setExpandedAssessments(prev => ({
      ...prev,
      [politicianId]: !prev[politicianId]
    }));
  };
  
  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setStatements([
        {
          id: '1',
          content: 'Project 2025 would be detrimental to essential programs like Medicaid and SNAP that millions of Americans rely on. I strongly oppose these harmful policies that would hurt the most vulnerable in our communities.',
          date: new Date('2025-04-10'),
          source_url: 'https://example.com/vargas-statement',
          source_name: 'Press Conference',
          context: 'Rep. Vargas made this statement during a press conference addressing budget proposals that would impact social programs.',
          is_verified: true,
          politician: {
            id: 'juan-vargas',
            name: 'Juan Vargas',
            party: 'Democrat',
            state: 'California',
            position: 'Representative',
            district: 'CA-52'
          },
          tags: [
            { id: '1', name: 'opposition' },
            { id: '2', name: 'press conference' },
            { id: '3', name: 'social programs' }
          ],
          has_assessment: true
        },
        {
          id: '2',
          content: 'Project 2025 represents a direct threat to our democratic institutions and the rights of all Americans. I will continue to fight against these dangerous policies that would undermine our healthcare system, roll back LGBTQ+ rights, and weaken our democratic processes.',
          date: new Date('2025-03-15'),
          source_url: 'https://example.com/baldwin-statement-1',
          source_name: 'Press Conference',
          context: 'Senator Baldwin made this statement during a press conference addressing Project 2025\'s potential impact on healthcare access.',
          is_verified: true,
          politician: {
            id: 'tammy-baldwin',
            name: 'Tammy Baldwin',
            party: 'Democrat',
            state: 'Wisconsin',
            position: 'U.S. Senator'
          },
          tags: [
            { id: '1', name: 'opposition' },
            { id: '4', name: 'healthcare' },
            { id: '5', name: 'LGBTQ+ rights' }
          ],
          has_assessment: true
        },
        {
          id: '3',
          content: 'President Biden\'s energy policies are hurting American families. We need to increase domestic oil and gas production to lower costs and ensure our energy independence.',
          date: new Date('2025-02-15'),
          source_url: 'https://example.com/barrasso-statement-2',
          source_name: 'Press Conference',
          context: 'Senator Barrasso delivered this statement during a press conference on energy policy.',
          is_verified: true,
          politician: {
            id: 'john-barrasso',
            name: 'John Barrasso',
            party: 'Republican',
            state: 'Wyoming',
            position: 'U.S. Senator'
          },
          tags: [
            { id: '7', name: 'energy policy' },
            { id: '9', name: 'fossil fuels' },
            { id: '2', name: 'press conference' }
          ],
          has_assessment: true
        },
        {
          id: '4',
          content: 'There is not a person in the Senate who\'s more worried about what Trump is doing to our democracy and our economy than I am.',
          date: new Date('2025-03-15'),
          source_url: 'https://example.com/bennet-statement-1',
          source_name: 'Press Conference',
          context: 'Senator Bennet made this statement during a press conference addressing former President Trump\'s influence on democracy.',
          is_verified: true,
          politician: {
            id: 'michael-bennet',
            name: 'Michael Bennet',
            party: 'Democrat',
            state: 'Colorado',
            position: 'U.S. Senator'
          },
          tags: [
            { id: '1', name: 'opposition' },
            { id: '2', name: 'press conference' },
            { id: '10', name: 'democracy' }
          ],
          has_assessment: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Verify statement
  const handleVerifyStatement = (id) => {
    // Mock implementation
    console.log('Verifying statement:', id);
    
    // Update the statement in the list
    setStatements(statements.map(statement => 
      statement.id === id ? { ...statement, is_verified: true } : statement
    ));
  };
  
  // Format date
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Render statement card
  const renderStatementCard = (statement) => {
    const politician = statement.politician;
    const date = new Date(statement.date);
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: 0,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'visible',
          backgroundColor: '#1e1e1e',
        }}
        className="file-folder"
      >
        {/* Verification status */}
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
            label={statement.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
            color={statement.is_verified ? 'success' : 'warning'}
            icon={statement.is_verified ? <VerifiedIcon /> : <WarningIcon />}
            sx={{ 
              fontFamily: '"Special Elite", "Courier New", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          />
        </Box>
        
        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
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
              <span className="evidence-tag">SUBJECT</span>
              <Box component="span" sx={{ ml: 1 }}>
                <Link 
                  component={RouterLink} 
                  to={`/politicians/${politician.id}`}
                  color="secondary"
                >
                  {politician.name}
                </Link>
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
              <span className="evidence-tag">DATE</span>
              <Box component="span" sx={{ ml: 1 }}>
                {formatDate(date)}
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
              <span className="evidence-tag">SOURCE</span>
              <Box component="span" sx={{ ml: 1 }}>
                <Link 
                  href={statement.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="secondary"
                >
                  {statement.source_name}
                </Link>
              </Box>
            </Typography>
          </Box>
          
          <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 2 }} />
          
          <Typography 
            variant="body1" 
            className="typewriter-text"
            sx={{ 
              color: '#f0f0f0',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              mb: 2,
              fontStyle: 'italic',
            }}
          >
            "{statement.content}"
          </Typography>
          
          {statement.context && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              className="typewriter-text"
              sx={{ mb: 2 }}
            >
              <span className="highlight highlight-blue">Context:</span> {statement.context}
            </Typography>
          )}
          
          {statement.tags && statement.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {statement.tags.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          )}
          
          {/* Assessment Panels */}
          {statement.has_assessment && (
            <>
              <Divider sx={{ borderColor: 'rgba(255, 152, 0, 0.3)', my: 2 }} />
              
              <Box>
                <Button
                  color="secondary"
                  size="small"
                  onClick={() => toggleAssessment(politician.id)}
                  startIcon={expandedAssessments[politician.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mb: 1 }}
                >
                  {expandedAssessments[politician.id] ? 'Hide Assessment' : 'Show Assessment'}
                </Button>
                
                <Collapse in={expandedAssessments[politician.id]}>
                  <Box sx={{ mt: 1 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      className="typewriter-text"
                      sx={{ mb: 2 }}
                    >
                      <span className="highlight highlight-yellow">Enhanced Assessment:</span> This statement is part of our overall evaluation of {politician.name}'s stance on Project 2025.
                    </Typography>
                    
                    {politician.id === 'juan-vargas' && <JuanVargasCompactPanel />}
                    {politician.id === 'tammy-baldwin' && <TammyBaldwinCompactPanel />}
                    {politician.id === 'john-barrasso' && <JohnBarrassoCompactPanel />}
                    {politician.id === 'michael-bennet' && <MichaelBennetCompactPanel />}
                  </Box>
                </Collapse>
              </Box>
            </>
          )}
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            component={RouterLink}
            to={`/statements/${statement.id}`}
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<FolderOpenIcon />}
            sx={{ 
              fontFamily: '"Special Elite", "Courier New", monospace',
              letterSpacing: '0.05em',
            }}
          >
            VIEW DETAILS
          </Button>
          
          {isAdmin && isAdmin() && !statement.is_verified && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<VerifiedIcon />}
              onClick={() => handleVerifyStatement(statement.id)}
              sx={{ 
                fontFamily: '"Special Elite", "Courier New", monospace',
                letterSpacing: '0.05em',
                ml: 'auto'
              }}
            >
              VERIFY
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Box my={4} className="file-folder">
        <Typography 
          variant="h3" 
          component="h1" 
          className="case-title typewriter-text"
          sx={{ 
            color: '#ff9800', 
            mb: 3,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          EVIDENCE COLLECTION
          <div className="typewriter-cursor"></div>
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            position: 'relative',
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            className="typewriter-text"
            sx={{ 
              color: '#ff9800',
              borderBottom: '1px solid rgba(255, 152, 0, 0.3)',
              pb: 1,
              mb: 2,
            }}
          >
            <span className="highlight highlight-yellow">STATEMENT VERIFICATION PROTOCOL</span>
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph
            className="typewriter-text"
            sx={{ 
              color: '#f0f0f0',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.7,
            }}
          >
            Our investigation meticulously documents politicians' statements regarding Project 2025. 
            Each statement is collected with source information, date, and context. Statements undergo 
            a rigorous verification process before being used in our accountability scoring system.
          </Typography>
        </Paper>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {statements.map((statement) => (
              <Grid item xs={12} sm={6} md={4} key={statement.id}>
                {renderStatementCard(statement)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default StatementsPage;
