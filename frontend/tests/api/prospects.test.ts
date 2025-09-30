/**
 * Contract tests for prospect submission API
 * Based on contracts/prospects-api.yaml
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { submitProspect } from '@/lib/api/prospects';
import type {
  ProspectFormData,
  ProspectSubmitResponse,
  ProspectValidationError,
} from '@/types/prospect';
import { ClientType } from '@/types/prospect';

// Mock server setup
const server = setupServer();

// Mock prospect data
const mockProspectData: ProspectFormData = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com',
  telephone: '+33612345678',
  adresseLigne1: '123 rue de la Paix',
  adresseLigne2: '',
  codePostal: '75001',
  ville: 'Paris',
  formationId: 'formation-1',
  formationNom: 'Formation React',
  dureeHeures: 35,
  nombreParticipants: 2,
  derouleHoraire: 'Jour 1: Introduction\nJour 2: Pratique',
  tarifTTC: 2500,
  dateDebut: '2025-01-15',
  dateFin: '2025-01-19',
  typeClient: ClientType.INDIVIDU,
  siret: '',
  nomSociete: '',
  fonctionBeneficiaire: '',
};

const mockCompanyProspectData: ProspectFormData = {
  ...mockProspectData,
  typeClient: ClientType.SOCIETE,
  siret: '12345678901234',
  nomSociete: 'ACME Corp',
};

const mockSuccessResponse: ProspectSubmitResponse = {
  success: true,
  id: 'prospect-123',
  message: 'Prospect créé avec succès',
};

const mockValidationError: ProspectValidationError = {
  success: false,
  message: 'Erreurs de validation',
  errors: {
    email: 'Format d\'email invalide',
    telephone: 'Format de téléphone invalide',
  },
};

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

describe('Prospect Submission API Contract Tests', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('POST /webhook-test/{id} - Submit prospect', () => {
    it('should successfully submit valid prospect data', async () => {
      // Arrange
      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          async (req, res, ctx) => {
            const body = await req.json();

            // Validate request structure
            expect(body).toMatchObject({
              nom: expect.any(String),
              prenom: expect.any(String),
              email: expect.any(String),
              telephone: expect.any(String),
              formationId: expect.any(String),
              typeClient: expect.stringMatching(/^(Societe|Individu)$/),
            });

            expect(body.submittedAt).toBeDefined();
            expect(body.formMode).toBe('production');

            return res(ctx.status(201), ctx.json(mockSuccessResponse));
          }
        )
      );

      // Act
      const result = await submitProspect(mockProspectData);

      // Assert
      expect(result).toEqual(mockSuccessResponse);
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });

    it('should submit company prospect with required fields', async () => {
      // Arrange
      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          async (req, res, ctx) => {
            const body = await req.json();

            // Validate company-specific fields
            expect(body.typeClient).toBe('Societe');
            expect(body.siret).toBe('12345678901234');
            expect(body.nomSociete).toBe('ACME Corp');

            return res(ctx.status(201), ctx.json(mockSuccessResponse));
          }
        )
      );

      // Act
      const result = await submitProspect(mockCompanyProspectData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidProspectData = {
        ...mockProspectData,
        email: 'invalid-email',
        telephone: 'invalid-phone',
      };

      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          (req, res, ctx) => {
            return res(ctx.status(400), ctx.json(mockValidationError));
          }
        )
      );

      // Act & Assert
      await expect(submitProspect(invalidProspectData)).rejects.toThrow();
    });

    it('should include metadata fields in request', async () => {
      // Arrange
      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          async (req, res, ctx) => {
            const body = await req.json();

            // Validate metadata
            expect(body.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            expect(body.formMode).toBe('production');

            return res(ctx.status(201), ctx.json(mockSuccessResponse));
          }
        )
      );

      // Act
      await submitProspect(mockProspectData);

      // Assert - expectations in the mock handler
    });

    it('should handle server errors', async () => {
      // Arrange
      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          (req, res, ctx) => {
            return res(
              ctx.status(500),
              ctx.json({
                message: 'Internal server error',
                code: 'SERVER_ERROR',
              })
            );
          }
        )
      );

      // Act & Assert
      await expect(submitProspect(mockProspectData)).rejects.toThrow();
    });

    it('should handle network failures', async () => {
      // Arrange
      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          (req, res, ctx) => {
            return res.networkError('Network error');
          }
        )
      );

      // Act & Assert
      await expect(submitProspect(mockProspectData)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      // Test missing required fields
      const testCases = [
        { field: 'nom', value: '' },
        { field: 'prenom', value: '' },
        { field: 'email', value: '' },
        { field: 'telephone', value: '' },
        { field: 'formationId', value: '' },
      ];

      for (const testCase of testCases) {
        const invalidData = { ...mockProspectData, [testCase.field]: testCase.value };

        await expect(submitProspect(invalidData)).rejects.toThrow();
      }
    });

    it('should validate company fields for Societe type', async () => {
      // Arrange
      const invalidCompanyData = {
        ...mockProspectData,
        typeClient: ClientType.SOCIETE as const,
        siret: '', // Missing required field
        nomSociete: '', // Missing required field
      };

      // Act & Assert
      await expect(submitProspect(invalidCompanyData)).rejects.toThrow();
    });

    it('should validate date constraints', async () => {
      // Arrange
      const invalidDateData = {
        ...mockProspectData,
        dateDebut: '2025-01-20',
        dateFin: '2025-01-15', // End date before start date
      };

      // Act & Assert
      await expect(submitProspect(invalidDateData)).rejects.toThrow();
    });

    it('should validate numeric constraints', async () => {
      // Test negative/invalid numbers
      const testCases = [
        { field: 'dureeHeures', value: 0 },
        { field: 'nombreParticipants', value: 0 },
        { field: 'tarifTTC', value: -100 },
      ];

      for (const testCase of testCases) {
        const invalidData = { ...mockProspectData, [testCase.field]: testCase.value };

        await expect(submitProspect(invalidData)).rejects.toThrow();
      }
    });

    it('should validate string length constraints', async () => {
      // Arrange
      const longString = 'a'.repeat(1000);
      const invalidLengthData = {
        ...mockProspectData,
        nom: longString, // Too long
      };

      // Act & Assert
      await expect(submitProspect(invalidLengthData)).rejects.toThrow();
    });

    it('should handle response schema validation', async () => {
      // Arrange
      const invalidResponse = {
        // Missing success field
        id: 'test-id',
      };

      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          (req, res, ctx) => {
            return res(ctx.status(201), ctx.json(invalidResponse));
          }
        )
      );

      // Act & Assert
      await expect(submitProspect(mockProspectData)).rejects.toThrow();
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle timeout errors', async () => {
      // Arrange
      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          (req, res, ctx) => {
            return res(ctx.delay(10000)); // Simulate timeout
          }
        )
      );

      // Act & Assert
      await expect(submitProspect(mockProspectData)).rejects.toThrow();
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      server.use(
        rest.post(
          'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388',
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.text('Invalid JSON'));
          }
        )
      );

      // Act & Assert
      await expect(submitProspect(mockProspectData)).rejects.toThrow();
    });
  });
});