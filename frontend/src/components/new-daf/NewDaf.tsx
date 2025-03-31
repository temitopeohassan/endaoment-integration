import type { FormEvent } from 'react';
import './NewDaf.css';
import { useMutation } from '@tanstack/react-query';
import { getEnvOrThrow } from '../../utils/env';

export const NewDaf = () => {
  const {
    mutate: createDaf,
    isIdle,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationKey: ['Create DAF'],
    mutationFn: async (formData: FormData) => {
      const rawFormObject = Object.fromEntries(formData.entries());

      // Validate required fields
      const requiredFields = [
        'name',
        'description',
        'fundAdvisor.firstName',
        'fundAdvisor.lastName',
        'fundAdvisor.email',
        'fundAdvisor.address.line1',
        'fundAdvisor.address.city',
        'fundAdvisor.address.state',
        'fundAdvisor.address.zip',
        'fundAdvisor.address.country'
      ];

      for (const field of requiredFields) {
        if (!rawFormObject[field]) {
          throw new Error(`${field} is required`);
        }
      }

      const cleanedForm = {
        name: rawFormObject['name'],
        description: rawFormObject['description'],
        fundAdvisor: {
          firstName: rawFormObject['fundAdvisor.firstName'],
          lastName: rawFormObject['fundAdvisor.lastName'],
          email: rawFormObject['fundAdvisor.email'],
          address: {
            line1: rawFormObject['fundAdvisor.address.line1'],
            line2: rawFormObject['fundAdvisor.address.line2'] || undefined,
            city: rawFormObject['fundAdvisor.address.city'],
            state: rawFormObject['fundAdvisor.address.state'],
            zip: rawFormObject['fundAdvisor.address.zip'],
            country: rawFormObject['fundAdvisor.address.country'],
          },
        },
      };

      const response = await fetch(
        `${getEnvOrThrow('SAFE_BACKEND_URL')}/create-daf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedForm),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create DAF');
      }

      return response.json();
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createDaf(new FormData(e.currentTarget));
  };

  return (
    <div className="new-daf-container">
      <h1>Create a New DAF</h1>
      {isError && (
        <div className="error-message">
          {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      )}
      {isSuccess && (
        <div className="success-message">
          <h2>DAF Created Successfully!</h2>
          <p>You can now start contributing to your DAF and making grants.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="daf-form" id="create-daf-form">
        <div className="form-group">
          <label htmlFor="name">Fund Name</label>
          <input type="text" id="name" name="name" required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" required />
        </div>

        <div className="form-section">
          <h2>Fund Advisor Information</h2>
          
          <div className="form-group">
            <label htmlFor="fundAdvisor.firstName">First Name</label>
            <input type="text" id="fundAdvisor.firstName" name="fundAdvisor.firstName" required />
          </div>

          <div className="form-group">
            <label htmlFor="fundAdvisor.lastName">Last Name</label>
            <input type="text" id="fundAdvisor.lastName" name="fundAdvisor.lastName" required />
          </div>

          <div className="form-group">
            <label htmlFor="fundAdvisor.email">Email</label>
            <input type="email" id="fundAdvisor.email" name="fundAdvisor.email" required />
          </div>

          <div className="form-group">
            <label htmlFor="fundAdvisor.address.line1">Address Line 1</label>
            <input type="text" id="fundAdvisor.address.line1" name="fundAdvisor.address.line1" required />
          </div>

          <div className="form-group">
            <label htmlFor="fundAdvisor.address.line2">Address Line 2 (Optional)</label>
            <input type="text" id="fundAdvisor.address.line2" name="fundAdvisor.address.line2" />
          </div>

          <div className="form-group">
            <label htmlFor="fundAdvisor.address.city">City</label>
            <input type="text" id="fundAdvisor.address.city" name="fundAdvisor.address.city" required />
          </div>

          <div className="form-group">
            <label htmlFor="fundAdvisor.address.state">State</label>
            <input type="text" id="fundAdvisor.address.state" name="fundAdvisor.address.state" required />
          </div>

          <div className="form-group">
            <label htmlFor="fundAdvisor.address.zip">ZIP Code</label>
            <input type="text" id="fundAdvisor.address.zip" name="fundAdvisor.address.zip" required />
          </div>

          <div className="form-group">
            <label htmlFor="fundAdvisor.address.country">Country</label>
            <input type="text" id="fundAdvisor.address.country" name="fundAdvisor.address.country" required />
          </div>
        </div>

        <button type="submit" disabled={isPending}>
          {isPending ? 'Creating DAF...' : 'Create DAF'}
        </button>
      </form>
    </div>
  );
};
