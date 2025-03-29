import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Job, jobService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { RootState } from '../store/store';
import RatingDialog from '../components/RatingDialog';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completionComment, setCompletionComment] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const fetchedJob = await jobService.getById(id);
        setJob(fetchedJob);
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending_review':
        return 'warning';
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

  const handleAcceptJob = async () => {
    if (!job || !user) return;

    try {
      await jobService.update(job._id, {
        status: 'in_progress',
        assignedTo: user.id
      });
      
      // Refresh job details
      const updatedJob = await jobService.getById(job._id);
      setJob(updatedJob);
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const handleSubmitCompletion = async () => {
    if (!job || !user) return;

    try {
      await jobService.submitCompletion(job._id, completionComment);
      
      // Refresh job details
      const updatedJob = await jobService.getById(job._id);
      setJob(updatedJob);
      setCompletionDialogOpen(false);
      setCompletionComment('');
    } catch (error) {
      console.error('Error submitting completion:', error);
    }
  };

  const handleApproveCompletion = async () => {
    if (!job) return;
    setRatingDialogOpen(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!job) return;

    try {
      await jobService.approveCompletion(job._id, rating);
      
      // Refresh job details
      const updatedJob = await jobService.getById(job._id);
      setJob(updatedJob);
    } catch (error) {
      console.error('Error approving completion:', error);
    }
  };

  const handleRejectCompletion = async () => {
    if (!job) return;

    try {
      await jobService.rejectCompletion(job._id);
      
      // Refresh job details
      const updatedJob = await jobService.getById(job._id);
      setJob(updatedJob);
    } catch (error) {
      console.error('Error rejecting completion:', error);
    }
  };

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

  if (!job) {
    return (
      <Container>
        <Typography align="center">Job not found.</Typography>
      </Container>
    );
  }

  const isCreator = typeof job.createdBy === 'string' 
    ? user?.id === job.createdBy 
    : user?.id === job.createdBy._id;
  const isAssigned = user?.id === job.assignedTo;
  const canAccept = job.status === 'open' && user;
  const canComplete = job.status === 'in_progress' && isAssigned;
  const canReview = job.status === 'pending_review' && isCreator;

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Button
              onClick={() => navigate(-1)}
              sx={{ mb: 2 }}
            >
              ← Back
            </Button>
            <Typography variant="h4" component="h1">
              {job.title}
            </Typography>
          </Box>
          <Chip
            label={job.status.replace('_', ' ')}
            color={getStatusColor(job.status)}
            size="medium"
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" paragraph>
              {job.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category: {job.category}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Time Estimate: {job.timeEstimate}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Reward: ${job.reward}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location: {job.location.address}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Timeline
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Posted {formatDistanceToNow(new Date(job.createdAt))} ago
              </Typography>
              {job.expiresAt && (
                <Typography variant="body2" color="text.secondary">
                  Expires {formatDistanceToNow(new Date(job.expiresAt))} from now
                </Typography>
              )}
              {job.completedAt && (
                <Typography variant="body2" color="text.secondary">
                  Completed {formatDistanceToNow(new Date(job.completedAt))} ago
                </Typography>
              )}
            </Box>

            {job.completionRequest && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Completion Request
                </Typography>
                <Typography variant="body2">
                  {job.completionRequest.comment}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Submitted {formatDistanceToNow(new Date(job.completionRequest.submittedAt))} ago
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {canAccept && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleAcceptJob}
                >
                  Accept Job
                </Button>
              )}

              {canComplete && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setCompletionDialogOpen(true)}
                >
                  Submit Completion
                </Button>
              )}

              {canReview && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={handleApproveCompletion}
                  >
                    Approve Completion
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={handleRejectCompletion}
                  >
                    Reject Completion
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={completionDialogOpen} onClose={() => setCompletionDialogOpen(false)}>
        <DialogTitle>Submit Job Completion</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Completion Comment"
            fullWidth
            multiline
            rows={4}
            value={completionComment}
            onChange={(e) => setCompletionComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompletionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitCompletion} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <RatingDialog
        open={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        onSubmit={handleRatingSubmit}
      />
    </Container>
  );
};

export default JobDetail; 