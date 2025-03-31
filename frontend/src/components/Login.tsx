import React, { useEffect, useState } from 'react';

const Login: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for login success/error parameters
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('login');
    
    if (loginStatus === 'success') {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Check login status
      checkLoginStatus();
    } else if (loginStatus === 'error') {
      const errorMessage = urlParams.get('message');
      console.error('Login failed:', errorMessage);
      // Handle error (show message to user, etc.)
    }
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('http://localhost:5454/check-login', {
        credentials: 'include', // Important! This ensures cookies are sent
      });
      
      if (!response.ok) {
        throw new Error('Login check failed');
      }
      
      const data = await response.json();
      if (data.isLoggedIn) {
        // Update your application state to reflect logged-in status
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default Login; 