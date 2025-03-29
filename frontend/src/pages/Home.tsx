import React from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Job, jobService } from '../services/api';
import JobList from '../components/JobList';

const categories = [
  'all',
  'Delivery',
  'Shopping',
  'Cleaning',
  'Moving',
  'Assembly',
  'Other',
];

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleCategoryChange = (category: string) => {
    setSearchParams({ category });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            component="h1"
            gutterBottom
            sx={{ mb: 0 }}
          >
            Available Jobs
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/jobs/create')}
            sx={{ ml: 2 }}
          >
            Create Job
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 4,
            '& .MuiChip-root': {
              m: 0.5,
            },
          }}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              label={category === 'all' ? 'All Jobs' : category}
              onClick={() => handleCategoryChange(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        <JobList selectedCategory={selectedCategory} />
      </Box>
    </Container>
  );
};

export default Home; 