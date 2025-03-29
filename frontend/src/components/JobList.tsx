import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Job, jobService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { RootState } from '../store/store';

interface JobListProps {
  selectedCategory?: string;
}

const JobList: React.FC<JobListProps> = ({ selectedCategory = 'all' }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedJobs = await jobService.getAll();
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'expired':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    try {
      await jobService.applyForJob(jobId);
      
      // Refresh jobs list
      const updatedJobs = await jobService.getAll();
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const filteredJobs = !jobs 
    ? [] 
    : jobs
        .filter(job => job.status !== 'completed')
        .filter(job => selectedCategory === 'all' || job.category === selectedCategory);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Container>
        <Typography align="center">No jobs available.</Typography>
      </Container>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <Container>
        <Typography align="center">No jobs found in this category.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {filteredJobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ 
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    {job.title}
                  </Typography>
                  <Chip 
                    label={job.status.replace('_', ' ')}
                    color={getStatusColor(job.status)}
                    size="small"
                  />
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {job.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={`$${job.reward}`} 
                    variant="outlined" 
                    size="small"
                  />
                  <Chip 
                    label={job.category} 
                    variant="outlined" 
                    size="small"
                  />
                  <Chip 
                    label={job.timeEstimate} 
                    variant="outlined" 
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Location: {job.location.address}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                </Typography>

                {job.expiresAt && (
                  <Typography variant="body2" color="text.secondary">
                    Expires {formatDistanceToNow(new Date(job.expiresAt))} from now
                  </Typography>
                )}

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    fullWidth
                  >
                    View Details
                  </Button>
                  {job.status === 'open' && user && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAcceptJob(job._id)}
                      fullWidth
                    >
                      Accept Job
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default JobList; 