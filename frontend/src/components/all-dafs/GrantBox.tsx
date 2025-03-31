import type { Daf, OrgListing } from '../../utils/endaoment-types';
import { useSearch } from '../../utils/useSearch';
import { useState, type FormEvent } from 'react';
import './GrantBox.css';
import { useMutation } from '@tanstack/react-query';
import { getEnvOrThrow } from '../../utils/env';
import { getEndaomentUrls } from '../../utils/endaoment-urls';

export const GRANT_BOX_ID = 'grant-box';

export const GrantBox = ({ daf }: { daf: Daf }) => {
  console.log('[GrantBox] Initializing with DAF:', { dafId: daf.id, dafName: daf.name });
  
  const {
    searchTerm,
    setSearchTerm,
    submitSearch,
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSearch();

  const [selectedOrg, setSelectedOrg] = useState<OrgListing | undefined>();
  const [purpose, setPurpose] = useState('General Grant');

  console.log('[GrantBox] Current state:', {
    hasSelectedOrg: !!selectedOrg,
    searchTerm,
    isLoading,
    hasNextPage,
    resultsCount: data?.pages?.reduce((acc, page) => acc + page.length, 0)
  });

  const {
    mutate: grant,
    isIdle,
    isPending,
    isSuccess,
    isError,
    error
  } = useMutation({
    mutationKey: ['Grant'],
    mutationFn: async (formData: FormData) => {
      console.log('[GrantBox] Initiating grant with form data:', {
        amount: formData.get('amount'),
        orgId: formData.get('orgId'),
        purpose
      });

      const response = await fetch(
        `${getEnvOrThrow('SAFE_BACKEND_URL')}/grant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: formData.get('amount'),
            fundId: daf.id,
            orgId: formData.get('orgId'),
            purpose,
          }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        console.error('[GrantBox] Grant request failed:', {
          status: response.status,
          statusText: response.statusText
        });
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process grant');
      }

      const responseData = await response.json();
      console.log('[GrantBox] Grant successful:', responseData);
      return responseData;
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[GrantBox] Handling form submission');

    if (!selectedOrg) {
      console.error('[GrantBox] No organization selected');
      return;
    }
    grant(new FormData(e.currentTarget));
  };

  return (
    <div className="grant-box">
      <h2>Grant from {daf.name}</h2>
      
      <div className="search-section">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for an organization..."
          className="search-input"
        />
        <button type="button" onClick={submitSearch}>
          Search
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grant-form">
        <div className="org-selection">
          {selectedOrg ? (
            <div className="selected-org">
              <h3>{selectedOrg.name}</h3>
              <button type="button" onClick={() => setSelectedOrg(undefined)}>
                Change Organization
              </button>
            </div>
          ) : (
            <div className="org-list">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                data?.pages.map((page) =>
                  page.map((org) => (
                    <button
                      type="button"
                      onClick={() => {
                        console.log('[GrantBox] Organization selected:', {
                          orgId: org.id,
                          orgName: org.name
                        });
                        setSelectedOrg(org);
                      }}
                      key={org.ein ?? org.id}
                      className="org-listing">
                      {org.name}
                    </button>
                  ))
                )
              )}
              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  type="button"
                  className="load-more-button"
                  disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                </button>
              )}
            </div>
          )}

          <input
            type="hidden"
            name="orgId"
            value={selectedOrg?.id || ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount in dollars</label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="purpose">Purpose</label>
          <input
            type="text"
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>

        {isError && (
          <div className="error-message">
            {error instanceof Error ? error.message : 'Failed to process grant'}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedOrg || isPending}
          className="submit-button">
          {isPending ? 'Processing...' : 'Submit Grant'}
        </button>

        {isSuccess && (
          <div className="success-message">
            Grant submitted successfully!
          </div>
        )}
      </form>
    </div>
  );
};
