import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
} from '@mui/material';
import { createJob } from '../services/api';

const categories = [
  'Delivery',
  'Shopping',
  'Cleaning',
  'Moving',
  'Assembly',
  'Other',
];

const timeEstimates = [
  'Less than 1 hour',
  '1-2 hours',
  '2-4 hours',
  '4-8 hours',
  'More than 8 hours',
];

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    category: '',
    location: {
      address: '',
      coordinates: {
        lat: '',
        lng: '',
      },
    },
    timeEstimate: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      if (locationField === 'coordinates') {
        const coordField = name.split('.')[2];
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              ...prev.location.coordinates,
              [coordField]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            [locationField]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        reward: parseFloat(formData.reward),
        location: {
          ...formData.location,
          coordinates: {
            lat: parseFloat(formData.location.coordinates.lat),
            lng: parseFloat(formData.location.coordinates.lng),
          },
        },
      };

      await createJob(jobData);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create New Job
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Reward ($)"
              name="reward"
              type="number"
              value={formData.reward}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              margin="normal"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Address"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Latitude"
              name="location.coordinates.lat"
              type="number"
              value={formData.location.coordinates.lat}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Longitude"
              name="location.coordinates.lng"
              type="number"
              value={formData.location.coordinates.lng}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Time Estimate"
              name="timeEstimate"
              value={formData.timeEstimate}
              onChange={handleChange}
              margin="normal"
              required
            >
              {timeEstimates.map((estimate) => (
                <MenuItem key={estimate} value={estimate}>
                  {estimate}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateJob; 