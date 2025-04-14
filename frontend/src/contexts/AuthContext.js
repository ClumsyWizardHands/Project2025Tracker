import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          // Set default auth header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token by fetching current user
          const response = await axios.get('/api/v1/auth/me');
          
          if (response.data && response.data.data.user) {
            setCurrentUser(response.data.data.user);
            setIsAuthenticated(true);
          } else {
            // Clear invalid data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up axios interceptor for token refresh
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Check if response includes a new token
        const newToken = response.headers['x-new-token'];
        if (newToken) {
          localStorage.setItem('token', newToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 403 (forbidden) and not already retrying
        if (error.response && error.response.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }
            
            const response = await axios.post('/api/v1/auth/refresh', {
              refresh_token: refreshToken
            });
            
            if (response.data && response.data.data.tokens) {
              const { access, refresh } = response.data.data.tokens;
              
              // Update tokens in localStorage
              localStorage.setItem('token', access);
              localStorage.setItem('refreshToken', refresh);
              
              // Update auth header
              axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
              
              // Retry the original request
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            
            // Clear auth state and redirect to login
            logout();
            
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/v1/auth/register', userData);
      
      if (response.data && response.data.data) {
        const { user, tokens } = response.data.data;
        
        // Store user and tokens
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        return user;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/v1/auth/login', credentials);
      
      if (response.data && response.data.data) {
        const { user, tokens } = response.data.data;
        
        // Store user and tokens
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        return user;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      
      // Call logout API if authenticated
      if (isAuthenticated) {
        const refreshToken = localStorage.getItem('refreshToken');
        await axios.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear auth state regardless of API success
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/v1/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.error?.message || 'Password reset request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/v1/auth/reset-password', { token, password });
      return response.data;
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.error?.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put('/api/v1/auth/me', userData);
      
      if (response.data && response.data.data && response.data.data.user) {
        const updatedUser = response.data.data.user;
        
        // Update stored user
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setCurrentUser(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.error?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    
    return currentUser.role === role;
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    hasRole,
    isAdmin: () => hasRole('admin'),
    isResearcher: () => hasRole(['researcher', 'admin']),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
