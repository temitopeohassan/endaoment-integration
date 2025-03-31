import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/logo.svg';
import { AllDafs } from './components/all-dafs/AllDafs';
import { NewDaf } from './components/new-daf/NewDaf';
import { OrgSearch } from './components/org-search/OrgSearch';
import { getEnvOrThrow } from './utils/env';
import type { LoginState } from './types/auth';
import { OrganizationSearch } from './components/search/OrganizationSearch';

type View = 'none' | 'org-search' | 'all-dafs' | 'new-daf' | 'search-organizations';

const checkSignedInQueryOptions = {
  queryKey: ['Check Signed In'],
  queryFn: async (): Promise<LoginState> => {
    const response = await fetch(
      `${getEnvOrThrow('SAFE_BACKEND_URL')}/check-login`,
      { credentials: 'include' }
    );
    const data = await response.json();
    return {
      isLoggedIn: data.isLoggedIn,
      isLoading: false,
      error: data.error
    };
  },
};

function App() {
  const queryClient = useQueryClient();
  
  // Pull login status from the server
  const { 
    data: loginState, 
    isLoading: isCheckingLogin,
    error: loginError
  } = useQuery(checkSignedInQueryOptions);

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationKey: ['Sign In'],
    mutationFn: async () => {
      const response = await fetch(
        `${getEnvOrThrow('SAFE_BACKEND_URL')}/init-login`,
        { credentials: 'include' }
      );
      const { url } = await response.json();
      window.location.href = url;
    },
  });

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationKey: ['Sign Out'],
    mutationFn: async () => {
      await fetch(`${getEnvOrThrow('SAFE_BACKEND_URL')}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Check Signed In'] });
    },
  });

  // Handle login callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('login');
    
    if (loginStatus === 'success') {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh login state
      queryClient.invalidateQueries({ queryKey: ['Check Signed In'] });
    } else if (loginStatus === 'error') {
      const errorMessage = urlParams.get('message');
      console.error('Login failed:', errorMessage);
    }
  }, []);

  // The current view the user is on
  const [currentView, setCurrentView] = useState<View>('none');

  return (
    <>
      <div>
        <a href="https://endaoment.org" target="_blank">
          <img src={logo} className="logo" alt="Endaoment logo" />
        </a>
      </div>
      <h1>Endaoment Quickstart</h1>
      
      {/* Show loading state */}
      {isCheckingLogin && <p>Checking login status...</p>}
      
      {/* Show error state */}
      {loginError && <p className="error">Error: {loginError}</p>}
      
      <div className="action-buttons">
        <button type="button" onClick={() => setCurrentView('org-search')}>
          Search Orgs
        </button>

        {loginState?.isLoggedIn ? (
          <>
            <button type="button" onClick={() => setCurrentView('all-dafs')}>
              View My DAFs
            </button>
            <button type="button" onClick={() => setCurrentView('new-daf')}>
              Open A New DAF
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('none');
                signOut();
              }}
              data-color="red"
              disabled={isSigningOut}>
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCurrentView('none');
              signIn();
            }}
            data-color="green"
            disabled={isSigningIn}>
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </button>
        )}
      </div>
      
      <main>
        {currentView === 'org-search' && <OrgSearch />}
        {currentView === 'all-dafs' && loginState?.isLoggedIn && <AllDafs />}
        {currentView === 'new-daf' && loginState?.isLoggedIn && <NewDaf />}
        {currentView === 'search-organizations' && loginState?.isLoggedIn && <OrganizationSearch />}
      </main>
    </>
  );
}

export default App;
