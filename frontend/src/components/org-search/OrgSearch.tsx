import './OrgSearch.css';
import { useSearch } from '../../utils/useSearch';
import { getEndaomentUrls } from '../../utils/endaoment-urls';

export const OrgSearch = () => {
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

  return (
    <>
      <input
        className="org-search-input"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        onBlur={submitSearch}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submitSearch();
        }}
      />
      <button type="button" onClick={submitSearch}>
        Search
      </button>
      <div className="org-list">
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          data?.pages.map((page) =>
            page.map((org) => (
              <div key={org.ein ?? org.id} className="org-listing">
                <img src={org.logo} alt={org.logo ? org.name : ''} />
                <a href={`${getEndaomentUrls().app}/orgs/${org.ein ?? org.id}`}>
                  {org.name}
                </a>
                <p>{org.description}</p>
              </div>
            ))
          )
        )}
        {hasNextPage &&
          (isFetchingNextPage ? (
            <span>Loading...</span>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              type="button"
              className="load-more-button">
              Load More
            </button>
          ))}
      </div>
    </>
  );
};
