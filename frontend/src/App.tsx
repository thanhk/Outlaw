import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import JobCreate from './pages/JobCreate';
import Profile from './pages/Profile';
import MyJobs from './pages/MyJobs';
import { RootState, AppDispatch } from './store/store';
import { fetchCurrentUser } from './store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  console.log('ProtectedRoute - Current user:', user);
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('App.tsx - Token from localStorage:', token);
    console.log('App.tsx - Current user in Redux:', user);
    
    if (token && !user) {
      console.log('App.tsx - Fetching current user...');
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Add a log when user changes
  useEffect(() => {
    console.log('App.tsx - User state changed:', user);
  }, [user]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <Layout>
                <JobDetail />
              </Layout>
            }
          />
          <Route
            path="/jobs/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <JobCreate />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyJobs />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
