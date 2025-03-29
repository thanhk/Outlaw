import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { jobService, Job } from '../services/api';
import { RootState } from '../store/store';

const categories = [
  'Delivery',
  'Shopping',
  'Cleaning',
  'Moving',
  'Assembly',
  'Other',
];

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

type CreateJobData = Omit<Job, '_id' | 'createdAt' | 'updatedAt'>;

const JobCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    category: '',
    reward: 0,
    timeEstimate: '',
    location: {
      type: 'Point',
      coordinates: [0, 0],
      address: '',
    },
    status: 'open',
    createdBy: currentUser?.id || '',
    assignedTo: undefined,
    expiresAt: new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    completedAt: undefined,
    completionRequest: undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects (e.g., location.address)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateJobData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      // For non-nested fields, convert reward to number if needed
      const finalValue = name === 'reward' ? Number(value) : value;
      setFormData(prev => ({
        ...prev,
        [name]: finalValue,
      }));
    }
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a job');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create a clean version of the form data
      const cleanFormData = {
        ...formData,
        reward: Number(formData.reward),
        location: {
          type: 'Point' as const,
          coordinates: formData.location.coordinates,
          address: formData.location.address,
        },
      };
      
      await jobService.create(cleanFormData);
      navigate('/');
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Container>
        <Typography color="error" align="center">
          You must be logged in to create a job
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Job
        </Typography>

        <Form onSubmit={handleSubmit}>
          <TextField
            required
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            required
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />

          <FormControl required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={handleCategoryChange}
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            required
            label="Reward ($)"
            name="reward"
            type="number"
            value={formData.reward}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            required
            label="Time Estimate"
            name="timeEstimate"
            value={formData.timeEstimate}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            required
            label="Location"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            fullWidth
          />

          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Job'}
            </Button>
          </Box>
        </Form>
      </Paper>
    </Container>
  );
};

export default JobCreate; 