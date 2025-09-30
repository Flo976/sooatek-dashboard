/**
 * TypeScript interface definitions for Prospect entities
 * Based on data-model.md specifications
 */

/**
 * Primary entity representing a potential client interested in training programs
 */
export interface Prospect {
  // Contact Information
  /** Last name (required) */
  nom: string;
  /** First name (required) */
  prenom: string;
  /** Email address (required, RFC 5322) */
  email: string;
  /** Phone number (required, international format) */
  telephone: string;

  // Address
  /** Address line 1 (required) */
  adresseLigne1: string;
  /** Address line 2 (optional) */
  adresseLigne2?: string;
  /** Postal code (required, 5 digits) */
  codePostal: string;
  /** City (required) */
  ville: string;

  // Training Information
  /** Selected formation ID (required) */
  formationId: string;
  /** Formation name for display */
  formationNom: string;
  /** Duration in hours (required, min: 1) */
  dureeHeures: number;
  /** Number of participants (required, min: 1) */
  nombreParticipants: number;
  /** Schedule details (required, multiline text) */
  derouleHoraire: string;

  // Financial
  /** Price including tax in EUR (required, min: 0) */
  tarifTTC: number;

  // Dates
  /** Start date (required, ISO 8601) */
  dateDebut: string;
  /** End date (required, ISO 8601) */
  dateFin: string;

  // Client Type
  /** Client type (required) */
  typeClient: 'Societe' | 'Individu';

  // Company Information (conditional)
  /** SIRET number (14 digits, required if typeClient === 'Societe') */
  siret?: string;
  /** Company name (required if typeClient === 'Societe') */
  nomSociete?: string;
  /** Beneficiary function (optional) */
  fonctionBeneficiaire?: string;

  // Metadata
  /** Submission timestamp (ISO 8601) */
  submittedAt?: string;
  /** Form submission mode */
  formMode?: 'test' | 'production';
}

/**
 * Form data structure for React Hook Form
 * Excludes metadata fields that are auto-generated
 */
export interface ProspectFormData extends Omit<Prospect, 'submittedAt' | 'formMode'> {}

/**
 * Request payload for prospect submission API
 */
export interface ProspectSubmitRequest extends ProspectFormData {
  submittedAt?: string;
  formMode?: 'test' | 'production';
}

/**
 * Response structure for prospect submission
 */
export interface ProspectSubmitResponse {
  /** Operation success indicator */
  success: boolean;
  /** Created prospect ID */
  id?: string;
  /** Success message */
  message?: string;
}

/**
 * Validation error response structure
 */
export interface ProspectValidationError {
  /** Operation success indicator (always false) */
  success: false;
  /** General error message */
  message?: string;
  /** Field-specific validation errors */
  errors?: {
    [field: string]: string;
  };
}

/**
 * Generic error response structure
 */
export interface ProspectError {
  /** Error message */
  message: string;
  /** Error code for debugging */
  code?: string;
}

/**
 * Form field validation state
 */
export interface FieldValidationState {
  /** Whether field is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Whether field has been touched */
  isTouched: boolean;
}

/**
 * Form state for managing form behavior
 */
export interface ProspectFormState {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form has been modified */
  isDirty: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Current form errors */
  errors: Record<string, string>;
  /** Whether to show company fields */
  showCompanyFields: boolean;
}

/**
 * Utility type for form field names
 */
export type ProspectFormFieldName = keyof ProspectFormData;

/**
 * Client type enum for better type safety
 */
export const ClientType = {
  SOCIETE: 'Societe' as const,
  INDIVIDU: 'Individu' as const,
} as const;

export type ClientTypeValue = typeof ClientType[keyof typeof ClientType];