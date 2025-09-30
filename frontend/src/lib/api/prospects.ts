/**
 * API client for prospect submission
 * Handles prospect data submission with validation and error handling
 */

import axios, { AxiosError } from 'axios';
import type {
  ProspectFormData,
  ProspectSubmitRequest,
  ProspectSubmitResponse,
  ProspectValidationError,
  ProspectError,
} from '@/types/prospect';
import { prospectValidationSchema } from '@/lib/validation/prospect-schema';

// API configuration
const PROSPECTS_API_URL = 'https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388';
const REQUEST_TIMEOUT = 10000; // 10 seconds for submissions

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Prepare prospect data for submission
 */
function prepareProspectData(formData: ProspectFormData): ProspectSubmitRequest {
  return {
    ...formData,
    submittedAt: new Date().toISOString(),
    formMode: 'production',
  };
}

/**
 * Validate prospect data before submission
 */
function validateProspectData(data: ProspectFormData): void {
  try {
    prospectValidationSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Données invalides: ${error.message}`);
    }
    throw new Error('Données invalides');
  }
}

/**
 * Submit prospect data to the API
 */
export async function submitProspect(
  formData: ProspectFormData
): Promise<ProspectSubmitResponse> {
  // Validate data before submission
  validateProspectData(formData);

  // Prepare submission payload
  const submissionData = prepareProspectData(formData);

  try {
    // Submit to API
    const response = await apiClient.post<ProspectSubmitResponse>(
      PROSPECTS_API_URL,
      submissionData
    );

    // Validate response structure
    if (!response.data || typeof response.data.success !== 'boolean') {
      throw new Error('Format de réponse invalide du serveur');
    }

    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || 'Échec de la soumission');
    }

    return result;
  } catch (error) {
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ProspectValidationError | ProspectError>;

      // Handle validation errors (400)
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data as ProspectValidationError;

        if (errorData.errors && typeof errorData.errors === 'object') {
          // Create detailed validation error message
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');

          throw new Error(`Erreurs de validation: ${errorMessages}`);
        }

        throw new Error(
          errorData.message || 'Données invalides, veuillez vérifier le formulaire'
        );
      }

      // Handle server errors (500)
      if (axiosError.response?.status === 500) {
        throw new Error('Erreur du serveur, veuillez réessayer plus tard');
      }

      // Handle timeout
      if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Délai d\'attente dépassé, veuillez réessayer');
      }

      // Handle network errors
      if (!axiosError.response) {
        throw new Error('Impossible de contacter le serveur');
      }

      // Handle other HTTP errors
      const statusCode = axiosError.response.status;
      if (statusCode >= 400 && statusCode < 500) {
        throw new Error('Erreur de requête, veuillez vérifier vos données');
      }

      if (statusCode >= 500) {
        throw new Error('Erreur du serveur, veuillez réessayer plus tard');
      }
    }

    // Handle validation errors from our own validation
    if (error instanceof Error && error.message.includes('Données invalides')) {
      throw error;
    }

    // Generic error fallback
    throw new Error('Erreur lors de l\'envoi du prospect');
  }
}

/**
 * Submit prospect in test mode (for development/testing)
 */
export async function submitProspectTest(
  formData: ProspectFormData
): Promise<ProspectSubmitResponse> {
  // Prepare test submission payload
  const submissionData: ProspectSubmitRequest = {
    ...formData,
    submittedAt: new Date().toISOString(),
    formMode: 'test',
  };

  try {
    const response = await apiClient.post<ProspectSubmitResponse>(
      PROSPECTS_API_URL,
      submissionData
    );

    return response.data;
  } catch (error) {
    console.warn('Test submission failed:', error);

    // Return mock success for testing
    return {
      success: true,
      id: `test-prospect-${Date.now()}`,
      message: 'Test prospect created successfully',
    };
  }
}

/**
 * Validate prospect data structure
 */
export function validateProspectStructure(data: unknown): data is ProspectFormData {
  try {
    prospectValidationSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get field-specific validation errors
 */
export function getFieldValidationErrors(data: ProspectFormData): Record<string, string> {
  try {
    prospectValidationSchema.parse(data);
    return {};
  } catch (error: any) {
    if (error?.errors && Array.isArray(error.errors)) {
      return error.errors.reduce((acc: Record<string, string>, err: any) => {
        const field = err.path?.join('.') || 'unknown';
        acc[field] = err.message;
        return acc;
      }, {});
    }
    return { general: 'Erreur de validation' };
  }
}

/**
 * Estimate submission payload size
 */
export function estimatePayloadSize(data: ProspectFormData): number {
  try {
    const submissionData = prepareProspectData(data);
    return JSON.stringify(submissionData).length;
  } catch {
    return 0;
  }
}

/**
 * Check if prospect data is ready for submission
 */
export function isProspectDataComplete(data: Partial<ProspectFormData>): boolean {
  const requiredFields: (keyof ProspectFormData)[] = [
    'nom',
    'prenom',
    'email',
    'telephone',
    'adresseLigne1',
    'codePostal',
    'ville',
    'formationId',
    'formationNom',
    'dureeHeures',
    'nombreParticipants',
    'derouleHoraire',
    'tarifTTC',
    'dateDebut',
    'dateFin',
    'typeClient',
  ];

  // Check basic required fields
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      return false;
    }
  }

  // Check company fields if needed
  if (data.typeClient === 'Societe') {
    if (!data.siret || !data.nomSociete) {
      return false;
    }
  }

  return true;
}

/**
 * Create prospect submission summary for confirmation
 */
export function createSubmissionSummary(data: ProspectFormData): {
  contact: string;
  formation: string;
  dates: string;
  pricing: string;
  participants: number;
} {
  return {
    contact: `${data.prenom} ${data.nom}`,
    formation: data.formationNom,
    dates: `${data.dateDebut} → ${data.dateFin}`,
    pricing: `${data.tarifTTC}€ TTC`,
    participants: data.nombreParticipants,
  };
}