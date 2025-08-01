import { createContext, useContext, useState, useEffect } from "react";
import AgencyService from "../services/AgencyService";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // If user is agency, fetch complete agency profile
    if (userData.role === 'agency') {
      try {
        const agencyProfile = await AgencyService.getCurrentAgencyProfile();
        const enrichedUserData = {
          ...userData,
          ...agencyProfile,
          // Preserve original user data but add agency details
          agency_name: agencyProfile.name || userData.name,
          agency_email: agencyProfile.email || userData.email,
          agency_phone: agencyProfile.phone || userData.phone,
          agency_address: agencyProfile.address || userData.address,
          agency_description: agencyProfile.description,
          agency_website: agencyProfile.website,
          agency_avatar: agencyProfile.avatar,
          license_number: agencyProfile.license_number,
          established_date: agencyProfile.established_date,
          rating: agencyProfile.rating,
          total_tours: agencyProfile.total_tours
        };
        
        setUser(enrichedUserData);
        localStorage.setItem('user', JSON.stringify(enrichedUserData));
        console.log('Agency profile loaded:', enrichedUserData);
      } catch (error) {
        console.error('Error loading agency profile:', error);
        // Continue with basic user data if agency profile fetch fails
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isAgency = () => {
    return hasRole('agency');
  };

  const isUser = () => {
    return hasRole('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isAgency,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 