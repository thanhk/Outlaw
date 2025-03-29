import express, { RequestHandler, Router } from 'express';
import { Job } from '../models/Job';
import mongoose from 'mongoose';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../types/express';
import { User } from '../models/User';

const router: Router = express.Router();

// Get all jobs
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'name email rating');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get a single job
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email rating');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job' });
  }
});

// Create a new job
router.post('/', auth, async (req: AuthRequest, res: express.Response) => {
  try {
    console.log('Creating job with data:', req.body);
    const job = new Job({
      ...req.body,
      createdBy: req.user?.id,
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error('Job creation error:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validationErrors 
      });
    }
    res.status(400).json({ message: 'Error creating job' });
  }
});

// Update a job
router.put('/:id', auth, async (req: AuthRequest, res: express.Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow creator to update the job
    if (job.createdBy.toString() === req.user?.id) {
      Object.assign(job, req.body);
      await job.save();
      res.json(job);
    } else {
      res.status(403).json({ message: 'Not authorized to update this job' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating job' });
  }
});

// Delete a job
router.delete('/:id', auth, async (req: AuthRequest, res: express.Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow creator to delete the job
    if (job.createdBy.toString() === req.user?.id) {
      await job.deleteOne();
      res.json({ message: 'Job deleted successfully' });
    } else {
      res.status(403).json({ message: 'Not authorized to delete this job' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// Apply for a job
router.put('/:id/apply', auth, async (req: AuthRequest, res: express.Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if job is open for applications
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is not open for applications' });
    }

    // Prevent job creator from applying for their own job
    if (job.createdBy.toString() === req.user?.id) {
      return res.status(400).json({ message: 'Cannot apply for your own job' });
    }

    // Assign the job to the user
    job.assignedTo = new mongoose.Types.ObjectId(req.user?.id);
    job.status = 'in_progress';
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error applying for job' });
  }
});

// Submit job completion
router.post('/:id/complete', auth, async (req: AuthRequest, res: express.Response) => {
  try {
    console.log('Received completion request:', {
      jobId: req.params.id,
      userId: req.user?.id,
      body: req.body
    });

    const job = await Job.findById(req.params.id);
    console.log('Found job:', {
      id: job?._id,
      status: job?.status,
      assignedTo: job?.assignedTo?.toString(),
      createdBy: job?.createdBy?.toString()
    });

    if (!job) {
      console.log('Job not found');
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if job is in progress
    if (job.status !== 'in_progress') {
      console.log('Invalid job status:', job.status);
      return res.status(400).json({ message: 'Job is not in progress' });
    }

    // Check if user is assigned to the job
    if (job.assignedTo?.toString() !== req.user?.id) {
      console.log('Unauthorized completion attempt:', {
        jobAssignedTo: job.assignedTo?.toString(),
        userId: req.user?.id
      });
      return res.status(403).json({ message: 'Not authorized to complete this job' });
    }

    // Update job status and add completion request
    job.status = 'pending_review';
    job.completionRequest = {
      comment: req.body.comment,
      submittedAt: new Date(),
    };
    await job.save();

    console.log('Successfully submitted job completion request');
    res.json(job);
  } catch (error) {
    console.error('Error in job completion:', error);
    res.status(500).json({ message: 'Error submitting job completion' });
  }
});

// Approve job completion
router.post('/:id/approve', auth, async (req: AuthRequest, res: express.Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow creator to approve completion
    if (job.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to approve this job completion' });
    }

    // Check if job is pending review
    if (job.status !== 'pending_review') {
      return res.status(400).json({ message: 'Job is not pending review' });
    }

    // Validate rating
    const rating = req.body.rating;
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating. Must be between 0 and 5' });
    }

    // Update job status and completion time
    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();

    // Update assignee's rating
    if (job.assignedTo) {
      const assignee = await User.findById(job.assignedTo);
      if (assignee) {
        // Calculate new average rating
        const currentTotal = assignee.rating * assignee.completedJobs;
        assignee.completedJobs += 1;
        assignee.rating = (currentTotal + rating) / assignee.completedJobs;
        await assignee.save();
      }
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error approving job completion' });
  }
});

// Reject job completion
router.post('/:id/reject', auth, async (req: AuthRequest, res: express.Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow creator to reject completion
    if (job.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to reject this job completion' });
    }

    // Check if job is pending review
    if (job.status !== 'pending_review') {
      return res.status(400).json({ message: 'Job is not pending review' });
    }

    // Revert job status and remove completion request
    job.status = 'in_progress';
    job.completionRequest = undefined;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting job completion' });
  }
});

export default router; 