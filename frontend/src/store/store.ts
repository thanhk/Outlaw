import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  rating: number;
  profilePicture?: string;
  createdJobs: number;
  completedJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 