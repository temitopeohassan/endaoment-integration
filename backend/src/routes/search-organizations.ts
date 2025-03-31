import type { Request, Response } from 'express';
import { getAccessToken } from '../utils/access-token';
import { getEndaomentUrls } from '../utils/endaoment-urls';

export async function searchOrganizations(req: Request, res: Response) {
  console.log('[searchOrganizations] Received search request:', {
    query: req.query,
    headers: req.headers
  });

  try {
    const { searchTerm, cursor } = req.query;
    
    if (!searchTerm || typeof searchTerm !== 'string') {
      console.error('[searchOrganizations] Missing or invalid search term:', searchTerm);
      return res.status(400).json({ 
        error: 'Missing search term',
        details: 'A search term is required'
      });
    }

    console.log('[searchOrganizations] Validating access token');
    let token;
    try {
      token = getAccessToken(req);
      console.log('[searchOrganizations] Access token validated successfully');
    } catch (error) {
      console.error('[searchOrganizations] Token validation failed:', error);
      return res.status(401).json({
        error: 'Authentication required',
        details: error instanceof Error ? error.message : String(error)
      });
    }
    
    const searchParams = new URLSearchParams({
      searchTerm,
      ...(cursor && typeof cursor === 'string' ? { cursor } : {})
    });

    const endaomentUrl = `${getEndaomentUrls().api}/v2/orgs/search?${searchParams}`;
    console.log('[searchOrganizations] Making request to Endaoment API:', endaomentUrl);

    const searchResponse = await fetch(
      endaomentUrl,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!searchResponse.ok) {
      console.error('[searchOrganizations] Search failed:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText
      });
      const errorData = await searchResponse.json();
      console.error('[searchOrganizations] Error details:', errorData);
      return res.status(searchResponse.status).json({
        error: errorData.message || 'Failed to search organizations',
        details: errorData
      });
    }

    const responseData = await searchResponse.json();
    console.log('[searchOrganizations] Search successful:', {
      resultCount: responseData.items?.length,
      hasMore: responseData.hasMore,
      cursor: responseData.nextCursor
    });

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('[searchOrganizations] Unexpected error:', error);
    return res.status(500).json({
      error: 'An error occurred while searching organizations',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 