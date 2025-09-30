/**
 * Integration tests for complete prospect creation flow
 * Tests end-to-end user scenarios and workflows
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ProspectCreationPage } from '@/app/dashboard/prospects/create/page';
import { ClientType } from '@/types/prospect';

// Mock all external dependencies
jest.mock('@/lib/api/formations', () => ({
  searchFormations: jest.fn(),
}));

jest.mock('@/lib/api/prospects', () => ({
  submitProspect: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockSearchFormations = require('@/lib/api/formations').searchFormations;
const mockSubmitProspect = require('@/lib/api/prospects').submitProspect;

const mockFormations = [
  {
    id: 'formation-1',
    nom: 'Formation React Avancé',
    description: 'Formation approfondie sur React',
    dureeStandard: 35,
  },
  {
    id: 'formation-2',
    nom: 'Formation TypeScript',
    description: 'Maîtrisez TypeScript',
    dureeStandard: 28,
  },
];

describe('Prospect Creation Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    mockSearchFormations.mockResolvedValue({
      formations: mockFormations,
      total: mockFormations.length,
      hasMore: false,
    });

    mockSubmitProspect.mockResolvedValue({
      success: true,
      id: 'prospect-123',
      message: 'Prospect créé avec succès',
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock beforeunload events
    Object.defineProperty(window, 'addEventListener', {
      value: jest.fn(),
      writable: true,
    });

    Object.defineProperty(window, 'removeEventListener', {
      value: jest.fn(),
      writable: true,
    });
  });

  describe('Complete Individual Prospect Flow', () => {
    it('should complete full individual prospect creation workflow', async () => {
      // Arrange
      render(<ProspectCreationPage />);

      // Act - Fill basic information
      await user.type(screen.getByLabelText(/nom/i), 'Dupont');
      await user.type(screen.getByLabelText(/prénom/i), 'Jean');
      await user.type(screen.getByLabelText(/email/i), 'jean.dupont@example.com');
      await user.type(screen.getByLabelText(/téléphone/i), '+33612345678');

      // Act - Fill address
      await user.type(screen.getByLabelText(/adresse ligne 1/i), '123 rue de la Paix');
      await user.type(screen.getByLabelText(/adresse ligne 2/i), 'Apt 4B');
      await user.type(screen.getByLabelText(/code postal/i), '75001');
      await user.type(screen.getByLabelText(/ville/i), 'Paris');

      // Act - Search and select formation
      const formationInput = screen.getByLabelText(/formation/i);
      await user.type(formationInput, 'react');

      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Formation React Avancé'));

      // Act - Fill training details
      await user.type(screen.getByLabelText(/durée en heures/i), '35');
      await user.type(screen.getByLabelText(/nombre de participants/i), '2');
      await user.type(
        screen.getByLabelText(/déroulé horaire/i),
        'Jour 1: Introduction aux concepts React\nJour 2: Hooks et state management\nJour 3: Projet pratique'
      );

      // Act - Fill financial and dates
      await user.type(screen.getByLabelText(/tarif/i), '2500');
      await user.type(screen.getByLabelText(/date de début/i), '2025-02-15');
      await user.type(screen.getByLabelText(/date de fin/i), '2025-02-17');

      // Act - Submit form
      const submitButton = screen.getByRole('button', { name: /envoyer/i });
      await user.click(submitButton);

      // Assert - Verify API call
      await waitFor(() => {
        expect(mockSubmitProspect).toHaveBeenCalledWith(
          expect.objectContaining({
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@example.com',
            telephone: '+33612345678',
            adresseLigne1: '123 rue de la Paix',
            adresseLigne2: 'Apt 4B',
            codePostal: '75001',
            ville: 'Paris',
            formationId: 'formation-1',
            formationNom: 'Formation React Avancé',
            dureeHeures: 35,
            nombreParticipants: 2,
            tarifTTC: 2500,
            dateDebut: '2025-02-15',
            dateFin: '2025-02-17',
            typeClient: ClientType.INDIVIDU,
          })
        );
      });

      // Assert - Verify success feedback
      await waitFor(() => {
        expect(screen.getByText(/prospect créé avec succès/i)).toBeInTheDocument();
      });

      // Assert - Verify form is cleared
      await waitFor(() => {
        expect(screen.getByLabelText(/nom/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
      });
    });
  });

  describe('Complete Company Prospect Flow', () => {
    it('should complete full company prospect creation workflow', async () => {
      // Arrange
      render(<ProspectCreationPage />);

      // Act - Fill basic information
      await user.type(screen.getByLabelText(/nom/i), 'Martin');
      await user.type(screen.getByLabelText(/prénom/i), 'Sophie');
      await user.type(screen.getByLabelText(/email/i), 'sophie.martin@acme.com');
      await user.type(screen.getByLabelText(/téléphone/i), '+33123456789');

      // Act - Select company type
      const clientTypeSelect = screen.getByLabelText(/type de client/i);
      await user.click(clientTypeSelect);
      await user.click(screen.getByText('Societe'));

      // Assert - Company fields appear
      await waitFor(() => {
        expect(screen.getByLabelText(/siret/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nom de la société/i)).toBeInTheDocument();
      });

      // Act - Fill company information
      await user.type(screen.getByLabelText(/siret/i), '12345678901234');
      await user.type(screen.getByLabelText(/nom de la société/i), 'ACME Corporation');
      await user.type(screen.getByLabelText(/fonction du bénéficiaire/i), 'Développeur Senior');

      // Act - Complete rest of form
      await user.type(screen.getByLabelText(/adresse ligne 1/i), '456 avenue des Entreprises');
      await user.type(screen.getByLabelText(/code postal/i), '92100');
      await user.type(screen.getByLabelText(/ville/i), 'Boulogne-Billancourt');

      // Act - Select formation
      const formationInput = screen.getByLabelText(/formation/i);
      await user.type(formationInput, 'typescript');

      await waitFor(() => {
        expect(screen.getByText('Formation TypeScript')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Formation TypeScript'));

      // Act - Fill remaining details
      await user.type(screen.getByLabelText(/durée en heures/i), '28');
      await user.type(screen.getByLabelText(/nombre de participants/i), '5');
      await user.type(screen.getByLabelText(/déroulé horaire/i), 'Formation intensive TypeScript sur 4 jours');
      await user.type(screen.getByLabelText(/tarif/i), '3500');
      await user.type(screen.getByLabelText(/date de début/i), '2025-03-10');
      await user.type(screen.getByLabelText(/date de fin/i), '2025-03-13');

      // Act - Submit form
      const submitButton = screen.getByRole('button', { name: /envoyer/i });
      await user.click(submitButton);

      // Assert - Verify API call with company data
      await waitFor(() => {
        expect(mockSubmitProspect).toHaveBeenCalledWith(
          expect.objectContaining({
            typeClient: ClientType.SOCIETE,
            siret: '12345678901234',
            nomSociete: 'ACME Corporation',
            fonctionBeneficiaire: 'Développeur Senior',
          })
        );
      });
    });
  });

  describe('Error Handling Flows', () => {
    it('should handle formation search failures gracefully', async () => {
      // Arrange
      mockSearchFormations.mockRejectedValue(new Error('Network error'));
      render(<ProspectCreationPage />);

      // Act
      const formationInput = screen.getByLabelText(/formation/i);
      await user.type(formationInput, 'react');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/erreur lors de la recherche/i)).toBeInTheDocument();
      });
    });

    it('should handle prospect submission failures', async () => {
      // Arrange
      mockSubmitProspect.mockRejectedValue(new Error('Submission failed'));
      render(<ProspectCreationPage />);

      // Act - Fill minimal required data
      await user.type(screen.getByLabelText(/nom/i), 'Test');
      await user.type(screen.getByLabelText(/prénom/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/téléphone/i), '+33123456789');
      await user.type(screen.getByLabelText(/adresse ligne 1/i), 'Test Address');
      await user.type(screen.getByLabelText(/code postal/i), '75001');
      await user.type(screen.getByLabelText(/ville/i), 'Paris');

      // Mock a formation selection
      const formationInput = screen.getByLabelText(/formation/i);
      await user.type(formationInput, 'Formation Test');
      // Simulate manual selection
      fireEvent.change(formationInput, { target: { value: 'Formation Test' } });

      await user.type(screen.getByLabelText(/durée en heures/i), '10');
      await user.type(screen.getByLabelText(/nombre de participants/i), '1');
      await user.type(screen.getByLabelText(/déroulé horaire/i), 'Test');
      await user.type(screen.getByLabelText(/tarif/i), '1000');
      await user.type(screen.getByLabelText(/date de début/i), '2025-01-15');
      await user.type(screen.getByLabelText(/date de fin/i), '2025-01-15');

      const submitButton = screen.getByRole('button', { name: /envoyer/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/erreur lors de l'envoi/i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors from server', async () => {
      // Arrange
      mockSubmitProspect.mockRejectedValue({
        response: {
          status: 400,
          data: {
            success: false,
            errors: {
              email: "Format d'email invalide",
              telephone: "Numéro de téléphone invalide",
            },
          },
        },
      });

      render(<ProspectCreationPage />);

      // Act - Fill form with invalid data
      await user.type(screen.getByLabelText(/nom/i), 'Test');
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /envoyer/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
        expect(screen.getByText(/numéro de téléphone invalide/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Guard', () => {
    it('should warn before leaving with unsaved changes', async () => {
      // Arrange
      const mockAddEventListener = jest.spyOn(window, 'addEventListener');
      render(<ProspectCreationPage />);

      // Act - Start filling form
      await user.type(screen.getByLabelText(/nom/i), 'Test User');

      // Assert - Navigation guard should be active
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should not warn after successful submission', async () => {
      // Arrange
      const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');
      render(<ProspectCreationPage />);

      // Act - Fill and submit form (simplified)
      await user.type(screen.getByLabelText(/nom/i), 'Test');
      // ... fill other required fields and submit

      const submitButton = screen.getByRole('button', { name: /envoyer/i });
      await user.click(submitButton);

      // Assert - Navigation guard should be removed
      await waitFor(() => {
        expect(mockRemoveEventListener).toHaveBeenCalledWith(
          'beforeunload',
          expect.any(Function)
        );
      });
    });
  });

  describe('Form Auto-save', () => {
    it('should save form data to sessionStorage', async () => {
      // Arrange
      const mockSetItem = jest.spyOn(window.sessionStorage, 'setItem');
      render(<ProspectCreationPage />);

      // Act
      await user.type(screen.getByLabelText(/nom/i), 'Auto Save Test');

      // Wait for debounced save
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith(
          'prospect_form_draft',
          expect.stringContaining('Auto Save Test')
        );
      }, { timeout: 2000 });
    });

    it('should restore form data from sessionStorage', async () => {
      // Arrange
      const mockGetItem = jest.spyOn(window.sessionStorage, 'getItem');
      mockGetItem.mockReturnValue(JSON.stringify({
        nom: 'Restored Name',
        prenom: 'Restored First Name',
        email: 'restored@example.com',
      }));

      // Act
      render(<ProspectCreationPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/nom/i)).toHaveValue('Restored Name');
        expect(screen.getByLabelText(/prénom/i)).toHaveValue('Restored First Name');
        expect(screen.getByLabelText(/email/i)).toHaveValue('restored@example.com');
      });
    });

    it('should clear saved data after successful submission', async () => {
      // Arrange
      const mockRemoveItem = jest.spyOn(window.sessionStorage, 'removeItem');
      render(<ProspectCreationPage />);

      // Act - Simplified submission
      const submitButton = screen.getByRole('button', { name: /envoyer/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockRemoveItem).toHaveBeenCalledWith('prospect_form_draft');
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain focus management throughout the flow', async () => {
      // Arrange
      render(<ProspectCreationPage />);

      // Act - Tab through form
      await user.tab();
      expect(screen.getByLabelText(/nom/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/prénom/i)).toHaveFocus();
    });

    it('should announce errors to screen readers', async () => {
      // Arrange
      render(<ProspectCreationPage />);

      // Act - Submit empty form
      const submitButton = screen.getByRole('button', { name: /envoyer/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        const errorMessage = screen.getByText(/nom requis/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('should support screen reader navigation of dropdown results', async () => {
      // Arrange
      render(<ProspectCreationPage />);

      // Act
      const formationInput = screen.getByLabelText(/formation/i);
      await user.type(formationInput, 'react');

      // Assert
      await waitFor(() => {
        expect(formationInput).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });
});