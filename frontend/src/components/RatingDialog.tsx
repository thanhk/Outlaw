import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Box,
  Typography,
} from '@mui/material';

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

const RatingDialog: React.FC<RatingDialogProps> = ({ open, onClose, onSubmit }) => {
  const [rating, setRating] = useState<number>(5);

  const handleSubmit = () => {
    onSubmit(rating);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rate the Job Completion</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Typography component="legend" gutterBottom>
            How would you rate this job completion?
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            size="large"
            precision={0.5}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {rating === 0 ? 'No rating' : `${rating} star${rating === 1 ? '' : 's'}`}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit Rating
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog; 