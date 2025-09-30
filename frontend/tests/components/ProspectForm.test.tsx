/**
 * Component tests for ProspectForm
 * Tests form behavior, validation, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ProspectForm } from '@/components/prospects/ProspectForm';
import { ClientType } from '@/types/prospect';

// Mock the API calls
jest.mock('@/lib/api/formations', () => ({
  searchFormations: jest.fn(),
}));

jest.mock('@/lib/api/prospects', () => ({
  submitProspect: jest.fn(),
}));

// Mock shadcn components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockSearchFormations = require('@/lib/api/formations').searchFormations;
const mockSubmitProspect = require('@/lib/api/prospects').submitProspect;

describe('ProspectForm Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchFormations.mockResolvedValue({
      formations: [
        { id: 'formation-1', nom: 'Formation React' },
        { id: 'formation-2', nom: 'Formation TypeScript' },
      ],
      total: 2,
      hasMore: false,
    });
    mockSubmitProspect.mockResolvedValue({
      success: true,
      id: 'prospect-123',
    });
  });

  describe('Rendering', () => {
    it('should render all required form fields', () => {
      // Act
      render(<ProspectForm />);

      // Assert
      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/téléphone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adresse ligne 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adresse ligne 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/code postal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ville/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/formation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/durée en heures/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre de participants/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/déroulé horaire/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tarif/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date de fin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type de client/i)).toBeInTheDocument();
    });

    it('should show submit button', () => {
      // Act
      render(<ProspectForm />);

      // Assert
      expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument();
    });

    it('should not show company fields initially', () => {
      // Act
      render(<ProspectForm />);

      // Assert
      expect(screen.queryByLabelText(/siret/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/nom de la société/i)).not.toBeInTheDocument();
    });
  });

  describe('Conditional Fields', () => {
    it('should show company fields when Societe is selected', async () => {
      // Arrange
      render(<ProspectForm />);
      const clientTypeSelect = screen.getByTestId('select');

      // Act
      await user.click(clientTypeSelect);
      await user.click(screen.getByText('Societe'));

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/siret/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nom de la société/i)).toBeInTheDocument();
      });
    });

    it('should hide company fields when Individu is selected', async () => {
      // Arrange
      render(<ProspectForm />);
      const clientTypeSelect = screen.getByTestId('select');

      // Act
      await user.click(clientTypeSelect);
      await user.click(screen.getByText('Societe'));
      await waitFor(() => {
        expect(screen.getByLabelText(/siret/i)).toBeInTheDocument();
      });

      await user.click(clientTypeSelect);
      await user.click(screen.getByText('Individu'));

      // Assert
      await waitFor(() => {
        expect(screen.queryByLabelText(/siret/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/nom de la société/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      // Arrange
      render(<ProspectForm />);
      const submitButton = screen.getByRole('button', { name: /envoyer/i });

      // Act
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/nom requis/i)).toBeInTheDocument();
        expect(screen.getByText(/prénom requis/i)).toBeInTheDocument();
        expect(screen.getByText(/email requis/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      // Arrange
      render(<ProspectForm />);
      const emailInput = screen.getByLabelText(/email/i);

      // Act
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      // Arrange
      render(<ProspectForm />);
      const phoneInput = screen.getByLabelText(/téléphone/i);

      // Act
      await user.type(phoneInput, 'invalid-phone');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/format international requis/i)).toBeInTheDocument();
      });
    });

    it('should validate postal code format', async () => {
      // Arrange
      render(<ProspectForm />);
      const postalCodeInput = screen.getByLabelText(/code postal/i);

      // Act
      await user.type(postalCodeInput, '123');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/code postal à 5 chiffres requis/i)).toBeInTheDocument();
      });
    });

    it('should validate date constraints', async () => {
      // Arrange
      render(<ProspectForm />);
      const startDateInput = screen.getByLabelText(/date de début/i);
      const endDateInput = screen.getByLabelText(/date de fin/i);

      // Act
      await user.type(startDateInput, '2025-01-20');
      await user.type(endDateInput, '2025-01-15'); // End before start
      await user.tab(); // Trigger validation

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/date de fin doit être postérieure/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate company fields when Societe is selected', async () => {
      // Arrange
      render(<ProspectForm />);
      const clientTypeSelect = screen.getByTestId('select');
      const submitButton = screen.getByRole('button', { name: /envoyer/i });

      // Act
      await user.click(clientTypeSelect);
      await user.click(screen.getByText('Societe'));
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/siret et nom de société sont requis/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async () => {
      await user.type(screen.getByLabelText(/nom/i), 'Dupont');
      await user.type(screen.getByLabelText(/prénom/i), 'Jean');
      await user.type(screen.getByLabelText(/email/i), 'jean.dupont@example.com');
      await user.type(screen.getByLabelText(/téléphone/i), '+33612345678');
      await user.type(screen.getByLabelText(/adresse ligne 1/i), '123 rue de la Paix');
      await user.type(screen.getByLabelText(/code postal/i), '75001');
      await user.type(screen.getByLabelText(/ville/i), 'Paris');
      await user.type(screen.getByLabelText(/durée en heures/i), '35');
      await user.type(screen.getByLabelText(/nombre de participants/i), '2');
      await user.type(screen.getByLabelText(/déroulé horaire/i), 'Formation intensive');
      await user.type(screen.getByLabelText(/tarif/i), '2500');
      await user.type(screen.getByLabelText(/date de début/i), '2025-01-15');
      await user.type(screen.getByLabelText(/date de fin/i), '2025-01-19');
    };

    it('should submit form with valid data', async () => {
      // Arrange
      render(<ProspectForm />);
      const submitButton = screen.getByRole('button', { name: /envoyer/i });

      // Act
      await fillValidForm();
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockSubmitProspect).toHaveBeenCalledWith(
          expect.objectContaining({
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@example.com',
            typeClient: ClientType.INDIVIDU,
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      // Arrange
      mockSubmitProspect.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      render(<ProspectForm />);
      const submitButton = screen.getByRole('button', { name: /envoyer/i });

      // Act
      await fillValidForm();
      await user.click(submitButton);

      // Assert
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/envoi en cours/i)).toBeInTheDocument();
    });

    it('should clear form after successful submission', async () => {
      // Arrange
      render(<ProspectForm />);
      const submitButton = screen.getByRole('button', { name: /envoyer/i });
      const nomInput = screen.getByLabelText(/nom/i);

      // Act
      await fillValidForm();
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(nomInput).toHaveValue('');
      });
    });

    it('should handle submission errors', async () => {
      // Arrange
      mockSubmitProspect.mockRejectedValue(new Error('Network error'));
      render(<ProspectForm />);
      const submitButton = screen.getByRole('button', { name: /envoyer/i });

      // Act
      await fillValidForm();
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/erreur lors de l'envoi/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Guard', () => {
    it('should warn before leaving with unsaved changes', async () => {
      // Arrange
      const mockBeforeUnload = jest.fn();
      Object.defineProperty(window, 'onbeforeunload', {
        set: mockBeforeUnload,
        configurable: true,
      });

      render(<ProspectForm />);

      // Act
      await user.type(screen.getByLabelText(/nom/i), 'Test');

      // Assert
      expect(mockBeforeUnload).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should not warn when form is clean', () => {
      // Arrange
      const mockBeforeUnload = jest.fn();
      Object.defineProperty(window, 'onbeforeunload', {
        set: mockBeforeUnload,
        configurable: true,
      });

      // Act
      render(<ProspectForm />);

      // Assert
      expect(mockBeforeUnload).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels', () => {
      // Act
      render(<ProspectForm />);

      // Assert
      expect(screen.getByLabelText(/nom/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
    });

    it('should announce validation errors to screen readers', async () => {
      // Arrange
      render(<ProspectForm />);
      const submitButton = screen.getByRole('button', { name: /envoyer/i });

      // Act
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        const errorMessage = screen.getByText(/nom requis/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});