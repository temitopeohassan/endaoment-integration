import { useState } from 'react';
import type { OrgListing } from './endaoment-types';
import { getEndaomentUrls } from './endaoment-urls';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_COUNT = 10;

const searchOnEndaoment = async (
  searchTerm: string,
  page: number
): Promise<OrgListing[]> => {
  if (searchTerm === '') return [];

  const offset = page * PAGE_COUNT;
  const response = await fetch(
    `${
      getEndaomentUrls().api
    }/v2/orgs/search?searchTerm=${searchTerm}&count=${PAGE_COUNT}&offset=${offset}`
  );
  return response.json();
};

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const queryResults = useInfiniteQuery({
    queryKey: ['Org Search', submittedSearchTerm],
    queryFn: ({ pageParam }) =>
      searchOnEndaoment(submittedSearchTerm, pageParam),
    getNextPageParam: (last, pages) =>
      last.length < PAGE_COUNT ? null : pages.length,
    initialPageParam: 0,
  });

  const submitSearch = () => {
    setSubmittedSearchTerm(searchTerm);
  };

  return {
    searchTerm,
    setSearchTerm,
    submitSearch,
    ...queryResults,
  };
};
