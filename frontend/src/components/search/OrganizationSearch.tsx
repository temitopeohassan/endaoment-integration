import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEnvOrThrow } from '../../utils/env';
import './OrganizationSearch.css';

export type Organization = {
  id: string;
  name: string;
  description: string;
  ein?: string;
};

type SearchResponse = {
  items: Organization[];
  hasMore: boolean;
  nextCursor?: string;
};

export const OrganizationSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['organizations', searchTerm],
    queryFn: async (): Promise<SearchResponse> => {
      console.log('[OrganizationSearch] Starting search with term:', searchTerm);
      
      if (!searchTerm) {
        console.log('[OrganizationSearch] Empty search term, returning empty results');
        return { items: [], hasMore: false };
      }
      
      try {
        const url = `${getEnvOrThrow('SAFE_BACKEND_URL')}/search-organizations?searchTerm=${encodeURIComponent(searchTerm)}`;
        console.log('[OrganizationSearch] Making request to:', url);
        
        const response = await fetch(url, { credentials: 'include' });
        
        if (!response.ok) {
          console.error('[OrganizationSearch] Search request failed:', {
            status: response.status,
            statusText: response.statusText
          });
          throw new Error('Failed to search organizations');
        }
        
        const data = await response.json();
        console.log('[OrganizationSearch] Search results:', {
          itemCount: data.items?.length,
          hasMore: data.hasMore
        });
        
        return data;
      } catch (error) {
        console.error('[OrganizationSearch] Error during search:', error);
        throw error;
      }
    },
    enabled: searchTerm.length > 0
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    console.log('[OrganizationSearch] Search term changed:', newTerm);
    setSearchTerm(newTerm);
  };

  console.log('[OrganizationSearch] Render state:', {
    hasSearchTerm: !!searchTerm,
    isLoading,
    hasError: !!error,
    resultCount: searchResults?.items?.length
  });

  return (
    <div className="organization-search">
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for organizations..."
          className="search-input"
        />
      </div>

      {isLoading && <div className="loading">Searching...</div>}
      
      {error && (
        <div className="error-message">
          {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      )}

      {searchResults && searchResults.items.length > 0 ? (
        <ul className="search-results">
          {searchResults.items.map((org) => (
            <li key={org.id} className="org-item">
              <h3>{org.name}</h3>
              {org.ein && <p className="ein">EIN: {org.ein}</p>}
              <p className="description">{org.description}</p>
            </li>
          ))}
        </ul>
      ) : searchTerm && !isLoading ? (
        <div className="no-results">No organizations found</div>
      ) : null}
    </div>
  );
}; 