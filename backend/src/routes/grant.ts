import type { Request, Response } from 'express';
import { getAccessToken } from '../utils/access-token';
import { getEndaomentUrls } from '../utils/endaoment-urls';
import crypto from 'crypto';

export async function grant(req: Request, res: Response) {
  console.log('[grant] Received grant request:', {
    body: req.body,
    headers: req.headers
  });

  const { amount, fundId: originFundId, orgId: destinationOrgId, purpose } = req.body;

  if (!amount || !originFundId || !destinationOrgId || !purpose) {
    console.error('[grant] Missing required fields:', {
      amount,
      originFundId,
      destinationOrgId,
      purpose
    });
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'amount, fundId, orgId, and purpose are required'
    });
  }

  try {
    console.log('[grant] Validating access token');
    const token = getAccessToken(req);
    console.log('[grant] Access token validated successfully');

    const idempotencyKey = crypto.randomUUID();
    console.log('[grant] Generated idempotency key:', idempotencyKey);

    const requestedAmount = (BigInt(amount) * 1000000n).toString();
    console.log('[grant] Converted amount to microdollars:', {
      originalAmount: amount,
      microdollars: requestedAmount
    });

    const grantUrl = `${getEndaomentUrls().api}/v1/transfers/async-grants`;
    console.log('[grant] Making request to Endaoment API:', grantUrl);

    const grantRequest = await fetch(grantUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        originFundId,
        destinationOrgId,
        requestedAmount,
        purpose,
        idempotencyKey,
      }),
    });

    const grantResult = await grantRequest.json();
    
    if (!grantRequest.ok) {
      console.error('[grant] Grant request failed:', {
        status: grantRequest.status,
        error: grantResult
      });
      return res.status(grantRequest.status).json({
        error: grantResult.message || 'Failed to process grant',
        details: grantResult
      });
    }

    console.log('[grant] Grant request successful:', grantResult);
    return res.status(200).json(grantResult);
  } catch (error) {
    console.error('[grant] Unexpected error:', error);
    return res.status(500).json({
      error: 'An error occurred while processing the grant',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
