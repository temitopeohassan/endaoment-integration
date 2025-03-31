import crypto from 'crypto';
import { getAccessToken } from '../utils/access-token';
import type { Request, Response } from 'express';
import { getEndaomentUrls } from '../utils/endaoment-urls';

export async function getWireInstructions(req: Request, res: Response) {
  try {
    const wireInstructionsResponse = await fetch(
      `${getEndaomentUrls().api}/v1/donation-pledges/wire/details/domestic`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!wireInstructionsResponse.ok) {
      throw new Error('Failed to fetch wire instructions');
    }

    const wireInstructions = await wireInstructionsResponse.json();
    res.status(200).json(wireInstructions);
  } catch (error) {
    console.error('[getWireInstructions] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch wire instructions',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function wireDonation(req: Request, res: Response) {
  try {
    const { amount, fundId } = req.body;

    if (!amount || !fundId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Both amount and fundId are required'
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        details: 'Amount must be greater than 0'
      });
    }

    const token = getAccessToken(req);
    const idempotencyKey = crypto.randomUUID();
    const pledgedAmountMicroDollars = (BigInt(amount) * 1000000n).toString();

    const donationResponse = await fetch(
      `${getEndaomentUrls().api}/v1/donation-pledges/wire`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pledgedAmountMicroDollars,
          receivingFundId: fundId,
          idempotencyKey,
        }),
      }
    );

    const responseData = await donationResponse.json();

    if (!donationResponse.ok) {
      console.error('[wireDonation] Donation failed:', {
        status: donationResponse.status,
        error: responseData
      });
      return res.status(donationResponse.status).json({
        error: responseData.message || 'Failed to process donation',
        details: responseData
      });
    }

    console.log('[wireDonation] Donation successful:', responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('[wireDonation] Error:', error);
    return res.status(500).json({
      error: 'An error occurred while processing the donation',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
