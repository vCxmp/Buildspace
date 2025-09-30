import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(null);

  // Stub functions that would normally interact with Firebase
  const signup = async (email, password, type) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a dummy user object
      const dummyUser = {
        email,
        uid: `dummy-${Date.now()}`,
      };
      
      setUser(dummyUser);
      setUserType(type);
      return { user: dummyUser };
    } catch (error) {
      throw new Error('Signup failed');
    }
  };

  const login = async (email, password) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a dummy user object
      const dummyUser = {
        email,
        uid: `dummy-${Date.now()}`,
      };
      
      setUser(dummyUser);
      return { user: dummyUser };
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      setUserType(null);
    } catch (error) {
      throw new Error('Logout failed');
    }
  };

  const value = {
    user,
    userType,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 