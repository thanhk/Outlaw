import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { User, Job, jobService, userService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { RootState } from '../store/store';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [createdJobs, setCreatedJobs] = useState<Job[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    console.log('Profile.tsx - Current user from Redux:', currentUser);
    
    const fetchUserData = async () => {
      if (!currentUser?.id) {
        console.log('Profile.tsx - No user ID available');
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }

      try {
        console.log('Profile.tsx - Fetching user data for ID:', currentUser.id);
        setLoading(true);
        setError(null);
        const userData = await userService.getById(currentUser.id);
        console.log('Profile.tsx - Fetched user data:', userData);
        setUser(userData);

        // Fetch jobs created by user
        const createdJobsData = await jobService.getAll();
        console.log('Profile.tsx - All jobs:', createdJobsData);
        
        if (!createdJobsData) {
          console.log('Profile.tsx - No jobs data received');
          setCreatedJobs([]);
          setAssignedJobs([]);
        } else {
          setCreatedJobs(createdJobsData.filter(job => job.createdBy === currentUser.id));
          setAssignedJobs(createdJobsData.filter(job => job.assignedTo === currentUser.id));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again later.');
        setCreatedJobs([]);
        setAssignedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

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

  if (!currentUser) {
    return (
      <Container>
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography color="error" align="center">
            Please log in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }

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
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography align="center">User not found.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            component="h1"
            gutterBottom
          >
            {user.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={`Rating: ${user.rating?.toFixed(1) || 'No ratings'}`}
              color="primary"
              size="small"
            />
            <Chip
              label={`Phone: ${user.phoneNumber || 'Not provided'}`}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Jobs Created
            </Typography>
            {createdJobs.length === 0 ? (
              <Typography>No jobs created yet.</Typography>
            ) : (
              createdJobs.map((job) => (
                <Paper key={job._id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {job.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={job.status.replace('_', ' ')}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                    <Chip
                      label={job.category}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                  </Typography>
                </Paper>
              ))
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Jobs Assigned
            </Typography>
            {assignedJobs.length === 0 ? (
              <Typography>No jobs assigned yet.</Typography>
            ) : (
              assignedJobs.map((job) => (
                <Paper key={job._id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {job.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={job.status.replace('_', ' ')}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                    <Chip
                      label={job.category}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                  </Typography>
                </Paper>
              ))
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 