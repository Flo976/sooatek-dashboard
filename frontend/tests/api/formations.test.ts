/**
 * Contract tests for formations search API
 * Based on contracts/formations-api.yaml
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { searchFormations } from '@/lib/api/formations';
import type { FormationSearchResponse, FormationSearchError } from '@/types/formation';

// Mock server setup
const server = setupServer();

// Mock API responses
const mockFormationsSuccess: FormationSearchResponse = {
  formations: [
    {
      id: 'formation-1',
      nom: 'Formation React Avancé',
      description: 'Formation approfondie sur React et ses écosystèmes',
      categorie: 'Développement Web',
      dureeStandard: 35,
    },
    {
      id: 'formation-2',
      nom: 'Formation TypeScript',
      description: 'Maîtrisez TypeScript pour vos projets',
      categorie: 'Développement Web',
      dureeStandard: 28,
    },
  ],
  total: 2,
  hasMore: false,
};

const mockFormationsError: FormationSearchError = {
  message: 'Erreur de recherche',
  code: 'SEARCH_ERROR',
};

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

describe('Formations Search API Contract Tests', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('GET /webhook/{id} - Search formations', () => {
    it('should return formations for valid search query', async () => {
      // Arrange
      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            const query = req.url.searchParams.get('query');
            const limit = req.url.searchParams.get('limit');

            expect(query).toBe('react');
            expect(limit).toBe('20');

            return res(ctx.status(200), ctx.json(mockFormationsSuccess));
          }
        )
      );

      // Act
      const result = await searchFormations({ query: 'react', limit: 20 });

      // Assert
      expect(result).toEqual(mockFormationsSuccess);
      expect(result.formations).toHaveLength(2);
      expect(result.formations[0]).toMatchObject({
        id: expect.any(String),
        nom: expect.any(String),
      });
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it('should validate minimum query length', async () => {
      // Act & Assert
      await expect(searchFormations({ query: 'a' })).rejects.toThrow(
        'Minimum 2 caractères requis'
      );
    });

    it('should handle empty results', async () => {
      // Arrange
      const emptyResponse: FormationSearchResponse = {
        formations: [],
        total: 0,
        hasMore: false,
      };

      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(emptyResponse));
          }
        )
      );

      // Act
      const result = await searchFormations({ query: 'nonexistent' });

      // Assert
      expect(result).toEqual(emptyResponse);
      expect(result.formations).toHaveLength(0);
    });

    it('should handle server errors', async () => {
      // Arrange
      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            return res(ctx.status(500), ctx.json(mockFormationsError));
          }
        )
      );

      // Act & Assert
      await expect(searchFormations({ query: 'test' })).rejects.toThrow();
    });

    it('should handle network failures', async () => {
      // Arrange
      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            return res.networkError('Network error');
          }
        )
      );

      // Act & Assert
      await expect(searchFormations({ query: 'test' })).rejects.toThrow();
    });

    it('should respect query parameter limits', async () => {
      // Arrange
      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            const limit = req.url.searchParams.get('limit');
            expect(limit).toBe('5');
            return res(ctx.status(200), ctx.json(mockFormationsSuccess));
          }
        )
      );

      // Act
      await searchFormations({ query: 'test', limit: 5 });

      // Assert - expectations in the mock handler
    });

    it('should validate response schema', async () => {
      // Arrange
      const invalidResponse = {
        formations: [{ invalidField: 'test' }], // Missing required fields
        // Missing total and hasMore
      };

      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(invalidResponse));
          }
        )
      );

      // Act & Assert
      await expect(searchFormations({ query: 'test' })).rejects.toThrow();
    });

    it('should handle pagination indicators', async () => {
      // Arrange
      const paginatedResponse: FormationSearchResponse = {
        formations: Array(20).fill(null).map((_, i) => ({
          id: `formation-${i}`,
          nom: `Formation ${i}`,
        })),
        total: 50,
        hasMore: true,
      };

      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(paginatedResponse));
          }
        )
      );

      // Act
      const result = await searchFormations({ query: 'formation' });

      // Assert
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(50);
      expect(result.formations).toHaveLength(20);
    });
  });

  describe('Error handling', () => {
    it('should handle 400 Bad Request errors', async () => {
      // Arrange
      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({
                message: 'Query too short',
                code: 'INVALID_QUERY',
              })
            );
          }
        )
      );

      // Act & Assert
      await expect(searchFormations({ query: 'ab' })).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      // Arrange
      server.use(
        rest.get(
          'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a',
          (req, res, ctx) => {
            return res(ctx.delay(10000)); // Simulate timeout
          }
        )
      );

      // Act & Assert
      await expect(searchFormations({ query: 'test' })).rejects.toThrow();
    });
  });
});