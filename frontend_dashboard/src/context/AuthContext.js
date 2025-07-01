import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// PUBLIC_INTERFACE
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// PUBLIC_INTERFACE
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    // Set base URL for backend API
    axios.defaults.baseURL = 'https://vscode-internal-549-beta.beta01.cloud.kavia.ai:3001';
    
    // Set default headers
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/profile');
          if (response.data.status === 'success') {
            setUser(response.data.data.user);
          } else {
            // Invalid token, remove it
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Invalid token, remove it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // PUBLIC_INTERFACE
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        return { success: true, user };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // PUBLIC_INTERFACE
  const signup = async (username, email, password, role = 'viewer') => {
    try {
      const response = await axios.post('/auth/signup', {
        username,
        email,
        password,
        role
      });

      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        return { success: true, user };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // PUBLIC_INTERFACE
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/auth/profile', userData);
      
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        return { success: true, user: response.data.data.user };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  // PUBLIC_INTERFACE
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (response.data.status === 'success') {
        return { success: true, message: response.data.data.message };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  // PUBLIC_INTERFACE
  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      viewer: 1,
      editor: 2,
      admin: 3
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  // PUBLIC_INTERFACE
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
