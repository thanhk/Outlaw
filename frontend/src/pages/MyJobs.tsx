import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Job, jobService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { RootState } from '../store/store';
import RatingDialog from '../components/RatingDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`jobs-tabpanel-${index}`}
      aria-labelledby={`jobs-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const MyJobs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabValue = parseInt(searchParams.get('tab') || '0', 10);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const allJobs = await jobService.getAll();
      setJobs(allJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSearchParams({ tab: newValue.toString() });
  };

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

  const handleSubmitCompletion = async (jobId: string, comment: string) => {
    try {
      await jobService.submitCompletion(jobId, comment);
      // Refresh jobs list
      const updatedJobs = await jobService.getAll();
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error submitting completion:', error);
    }
  };

  const handleApproveCompletion = async (jobId: string) => {
    setSelectedJobId(jobId);
    setRatingDialogOpen(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!selectedJobId) return;
    
    try {
      await jobService.approveCompletion(selectedJobId, rating);
      // Refresh jobs list
      const updatedJobs = await jobService.getAll();
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error approving completion:', error);
    }
  };

  const handleRejectCompletion = async (jobId: string) => {
    try {
      await jobService.rejectCompletion(jobId);
      // Refresh jobs list
      const updatedJobs = await jobService.getAll();
      setJobs(updatedJobs);
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

  if (!jobs || jobs.length === 0) {
    return (
      <Container>
        <Typography align="center">No jobs available.</Typography>
      </Container>
    );
  }

  const isCreator = (job: Job) => {
    const creatorId = typeof job.createdBy === 'string' ? job.createdBy : job.createdBy._id;
    return creatorId === user?.id;
  };

  const isAssigned = (job: Job) => job.assignedTo === user?.id;

  const openJobs = jobs.filter(job => job.status === 'open' && isCreator(job));
  const inProgressJobs = jobs.filter(job => 
    job.status === 'in_progress' && (isCreator(job) || isAssigned(job))
  );
  const pendingReviewJobs = jobs.filter(job => 
    job.status === 'pending_review' && (isCreator(job) || isAssigned(job))
  );
  const completedJobs = jobs.filter(job => 
    job.status === 'completed' && (isCreator(job) || isAssigned(job))
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Jobs
        </Typography>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab
            label={`Open (${openJobs.length})`}
            value={0}
          />
          <Tab
            label={`In Progress (${inProgressJobs.length})`}
            value={1}
          />
          <Tab
            label={`Pending Review (${pendingReviewJobs.length})`}
            value={2}
          />
          <Tab
            label={`Completed (${completedJobs.length})`}
            value={3}
          />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {(() => {
          switch (tabValue) {
            case 0:
              return openJobs.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center">No open jobs.</Typography>
                </Grid>
              ) : (
                openJobs.map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h2" noWrap>
                            {job.title}
                          </Typography>
                          <Chip
                            label={job.status.replace('_', ' ')}
                            color={getStatusColor(job.status)}
                            size="small"
                          />
                        </Box>
                        <Typography color="text.secondary" gutterBottom>
                          {job.description.substring(0, 100)}...
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          ${job.reward}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Category: {job.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {job.timeEstimate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {job.location.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              );
            case 1:
              return inProgressJobs.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center">No jobs in progress.</Typography>
                </Grid>
              ) : (
                inProgressJobs.map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h2" noWrap>
                            {job.title}
                          </Typography>
                          <Chip
                            label={job.status.replace('_', ' ')}
                            color={getStatusColor(job.status)}
                            size="small"
                          />
                        </Box>
                        <Typography color="text.secondary" gutterBottom>
                          {job.description.substring(0, 100)}...
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          ${job.reward}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Category: {job.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {job.timeEstimate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {job.location.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              );
            case 2:
              return pendingReviewJobs.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center">No jobs pending review.</Typography>
                </Grid>
              ) : (
                pendingReviewJobs.map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h2" noWrap>
                            {job.title}
                          </Typography>
                          <Chip
                            label={job.status.replace('_', ' ')}
                            color={getStatusColor(job.status)}
                            size="small"
                          />
                        </Box>
                        <Typography color="text.secondary" gutterBottom>
                          {job.description.substring(0, 100)}...
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          ${job.reward}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Category: {job.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {job.timeEstimate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {job.location.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                        </Typography>
                        {job.completionRequest && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Completion Comment: {job.completionRequest.comment}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                          View Details
                        </Button>
                        {typeof job.createdBy !== 'string' && job.createdBy._id === user?.id && (
                          <>
                            <Button
                              size="small"
                              color="success"
                              onClick={() => handleApproveCompletion(job._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRejectCompletion(job._id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              );
            case 3:
              return completedJobs.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center">No completed jobs.</Typography>
                </Grid>
              ) : (
                completedJobs.map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h2" noWrap>
                            {job.title}
                          </Typography>
                          <Chip
                            label={job.status.replace('_', ' ')}
                            color={getStatusColor(job.status)}
                            size="small"
                          />
                        </Box>
                        <Typography color="text.secondary" gutterBottom>
                          {job.description.substring(0, 100)}...
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          ${job.reward}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Category: {job.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {job.timeEstimate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {job.location.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed {formatDistanceToNow(new Date(job.completedAt!))} ago
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              );
            default:
              return null;
          }
        })()}
      </Grid>

      <RatingDialog
        open={ratingDialogOpen}
        onClose={() => {
          setRatingDialogOpen(false);
          setSelectedJobId(null);
        }}
        onSubmit={handleRatingSubmit}
      />
    </Container>
  );
};

export default MyJobs; 