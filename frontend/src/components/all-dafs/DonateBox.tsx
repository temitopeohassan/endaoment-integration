import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import type { Daf, WireInstructions } from '../../utils/endaoment-types';
import { getEnvOrThrow } from '../../utils/env';
import type { FormEvent } from 'react';
import { getEndaomentUrls } from '../../utils/endaoment-urls';
import './DonateBox.css';

export const DONATE_BOX_ID = 'donate-box';

const getWireInstructionsQueryOptions = queryOptions({
  queryKey: ['Wire Instructions'],
  queryFn: async (): Promise<WireInstructions> => {
    const response = await fetch(
      `${getEnvOrThrow('SAFE_BACKEND_URL')}/wire-donation`,
      {
        credentials: 'include',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch wire instructions');
    }
    return response.json();
  },
});

export const DonateBox = ({ daf }: { daf: Daf }) => {
  const { 
    data: wireInstructions, 
    isLoading: isLoadingInstructions,
    error: wireError
  } = useQuery(getWireInstructionsQueryOptions);

  const {
    mutate: donate,
    isIdle,
    isPending,
    isSuccess,
    isError,
    error: donationError,
  } = useMutation({
    mutationKey: ['Donate'],
    mutationFn: async (formData: FormData) => {
      const amount = formData.get('amount');
      if (!amount || Number(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const response = await fetch(
        `${getEnvOrThrow('SAFE_BACKEND_URL')}/wire-donation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: formData.get('amount'),
            fundId: daf.id,
          }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process donation');
      }

      return response.json();
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    donate(new FormData(e.currentTarget));
  };

  if (isLoadingInstructions) {
    return <div className="box">Loading wire instructions...</div>;
  }

  if (wireError) {
    return (
      <div className="box error">
        Failed to load wire instructions. Please try again later.
      </div>
    );
  }

  return (
    <div className="box donation-box">
      <h4>
        {'Donate to '}
        <a href={`${getEndaomentUrls().app}/funds/${daf.id}`}>{daf.name}</a>
      </h4>

      {isSuccess ? (
        <div className="success-message">
          <h3>Donation Successful!</h3>
          <p>Your donation has been successfully processed.</p>
          <p>Please complete the wire transfer using the instructions below.</p>
        </div>
      ) : (
        <form id="donate-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount in dollars</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              min="0.01" 
              step="0.01"
              required 
            />
          </div>

          {isError && (
            <div className="error-message">
              {donationError instanceof Error ? donationError.message : 'Failed to process donation'}
            </div>
          )}

          <button type="submit" disabled={isPending}>
            {isPending ? 'Processing...' : 'Donate'}
          </button>
        </form>
      )}

      <div className="wire-instructions">
        <h5>Wire Transfer Instructions</h5>
        <div className="instruction-details">
          <p>
            Please wire your donation to:
          </p>
          <div className="detail-item">
            <span>Bank Name:</span>
            <strong>{wireInstructions?.receivingBank.name}</strong>
          </div>
          <div className="detail-item">
            <span>Account Number:</span>
            <strong>{wireInstructions?.beneficiary.accountNumber}</strong>
          </div>
          <div className="detail-item">
            <span>Routing Number:</span>
            <strong>{wireInstructions?.receivingBank.abaRoutingNumber}</strong>
          </div>
          <div className="detail-item">
            <span>Beneficiary Name:</span>
            <strong>{wireInstructions?.beneficiary.name}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
