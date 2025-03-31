import type { Request, Response } from 'express';
import { getAccessToken } from '../utils/access-token';
import { getEndaomentUrls } from '../utils/endaoment-urls';

interface FundAdvisor {
  firstName: string;
  lastName: string;
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }
}

export const createDaf = async (req: Request, res: Response) => {
  console.log('[createDaf] Starting DAF creation with body:', req.body);
  
  try {
    // Validate token first
    let token;
    try {
      token = getAccessToken(req);
      console.log('[createDaf] Successfully retrieved access token');
    } catch (error) {
      console.error('[createDaf] Token validation failed:', error);
      return res.status(401).json({ 
        error: 'Authentication required',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    const { name, description, fundAdvisor } = req.body;
    console.log('[createDaf] Extracted form data:', { name, description, fundAdvisor });
    
    if (!name || !description || !fundAdvisor) {
      console.error('[createDaf] Missing required fields:', { name, description, fundAdvisor });
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'name, description, and fundAdvisor are required'
      });
    }

    // Validate fund advisor fields
    const requiredAdvisorFields = ['firstName', 'lastName', 'email'];
    for (const field of requiredAdvisorFields) {
      if (!fundAdvisor[field]) {
        console.error('[createDaf] Missing advisor field:', field);
        return res.status(400).json({
          error: 'Missing required fund advisor field',
          details: `fundAdvisor.${field} is required`
        });
      }
    }

    // Validate address fields
    const requiredAddressFields = ['line1', 'city', 'state', 'zip', 'country'];
    for (const field of requiredAddressFields) {
      if (!fundAdvisor.address?.[field]) {
        return res.status(400).json({
          error: 'Missing required address field',
          details: `fundAdvisor.address.${field} is required`
        });
      }
    }

    console.log('[createDaf] Making request to Endaoment API');
    const fundCreationResponse = await fetch(
      `${getEndaomentUrls().api}/v1/funds`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fundInput: {
            name,
            description,
            advisor: {
              firstName: fundAdvisor.firstName,
              lastName: fundAdvisor.lastName,
              email: fundAdvisor.email,
              address: {
                line1: fundAdvisor.address.line1,
                line2: fundAdvisor.address.line2,
                city: fundAdvisor.address.city,
                state: fundAdvisor.address.state,
                zip: fundAdvisor.address.zip,
                country: fundAdvisor.address.country
              }
            }
          }
        })
      }
    );

    console.log('[createDaf] Endaoment API response status:', fundCreationResponse.status);
    const responseData = await fundCreationResponse.json();
    console.log('[createDaf] Endaoment API response data:', responseData);

    if (!fundCreationResponse.ok) {
      console.error('[createDaf] DAF creation failed:', {
        status: fundCreationResponse.status,
        error: responseData
      });
      return res.status(fundCreationResponse.status).json({
        error: responseData.message || 'Failed to create DAF',
        details: responseData
      });
    }

    console.log('[createDaf] DAF created successfully:', responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('[createDaf] Unexpected error:', error);
    return res.status(500).json({
      error: 'An error occurred while creating the DAF',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};