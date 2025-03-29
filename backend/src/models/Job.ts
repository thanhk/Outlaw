import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  reward: number;
  category: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  status: 'open' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled' | 'expired';
  timeEstimate: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  completionRequest?: {
    comment: string;
    submittedAt: Date;
  };
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    reward: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['Delivery', 'Shopping', 'Cleaning', 'Moving', 'Assembly', 'Other'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(v: number[]) {
            return v.length === 2;
          },
          message: 'Coordinates must be [longitude, latitude]'
        }
      },
      address: {
        type: String,
        required: true,
      }
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'in_progress', 'pending_review', 'completed', 'cancelled', 'expired'],
      default: 'open',
    },
    timeEstimate: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from creation
    },
    completedAt: {
      type: Date,
    },
    completionRequest: {
      comment: {
        type: String,
        required: false,
      },
      submittedAt: {
        type: Date,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for location-based queries
jobSchema.index({ location: '2dsphere' });

// Index for querying expired jobs
jobSchema.index({ expiresAt: 1 });

// Pre-save middleware to update status based on expiration
jobSchema.pre('save', function(next) {
  if (this.status !== 'completed' && this.status !== 'cancelled') {
    if (this.expiresAt < new Date()) {
      this.status = 'expired';
    }
  }
  next();
});

// Method to check if job is expired
jobSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date();
};

// Method to complete a job
jobSchema.methods.complete = function(): void {
  this.status = 'completed';
  this.completedAt = new Date();
};

export const Job = mongoose.model<IJob>('Job', jobSchema); 