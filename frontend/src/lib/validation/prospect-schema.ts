/**
 * Prospect validation schemas using Zod
 * Provides comprehensive validation for prospect creation form
 */

import { z } from 'zod';
import { ClientType } from '@/types/prospect';

/**
 * Base prospect validation schema without refinements (for shape access)
 */
const baseProspectSchema = z.object({
  // Contact fields
  nom: z
    .string()
    .min(1, "Nom requis")
    .max(100, "Nom trop long (maximum 100 caractères)")
    .trim(),
  prenom: z
    .string()
    .min(1, "Prénom requis")
    .max(100, "Prénom trop long (maximum 100 caractères)")
    .trim(),
  email: z
    .string()
    .min(1, "Email requis")
    .email("Format d'email invalide")
    .max(255, "Email trop long")
    .trim()
    .toLowerCase(),
  telephone: z
    .string()
    .min(1, "Téléphone requis")
    .regex(
      /^(?:\+33|0)[1-9](?:[0-9]{8})$|^\+(?:[1-9]\d{0,3})[1-9]\d{4,14}$/,
      "Format de téléphone invalide (français ou international)"
    ),

  // Address fields
  adresseLigne1: z
    .string()
    .min(1, "Adresse requise")
    .max(200, "Adresse trop longue")
    .trim(),
  adresseLigne2: z
    .string()
    .max(200, "Adresse trop longue")
    .trim()
    .optional()
    .or(z.literal("")),
  codePostal: z
    .string()
    .min(1, "Code postal requis")
    .regex(/^\d{5}$/, "Code postal français requis (5 chiffres)")
    .trim(),
  ville: z
    .string()
    .min(1, "Ville requise")
    .max(100, "Nom de ville trop long")
    .trim(),

  // Formation fields
  formationId: z
    .string()
    .min(1, "Formation requise"),
  formationNom: z
    .string()
    .min(1, "Nom de formation requis"),
  dureeHeures: z
    .number()
    .min(1, "Durée minimum 1 heure")
    .max(1000, "Durée maximum 1000 heures"),
  nombreParticipants: z
    .number()
    .min(1, "Minimum 1 participant")
    .max(100, "Maximum 100 participants"),
  derouleHoraire: z
    .string()
    .min(1, "Déroulé horaire requis")
    .max(500, "Déroulé trop long")
    .trim(),
  tarifTTC: z
    .number()
    .min(0, "Tarif ne peut pas être négatif")
    .max(100000, "Tarif maximum 100 000€"),

  // Date fields
  dateDebut: z
    .string()
    .min(1, "Date de début requise")
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide"),
  dateFin: z
    .string()
    .min(1, "Date de fin requise")
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide"),

  // Company fields (conditional)
  typeClient: z.nativeEnum(ClientType, {
    required_error: "Type de client requis",
  }),
  siret: z
    .string()
    .regex(/^\d{14}$/, "SIRET doit contenir 14 chiffres")
    .trim()
    .optional()
    .or(z.literal("")),
  nomSociete: z
    .string()
    .max(200, "Nom de société trop long")
    .trim()
    .optional()
    .or(z.literal("")),
  fonctionBeneficiaire: z
    .string()
    .max(100, "Fonction trop longue (maximum 100 caractères)")
    .trim()
    .optional()
    .or(z.literal("")),
});

/**
 * Main prospect validation schema with refinements
 */
export const prospectValidationSchema = baseProspectSchema
.refine((data) => {
  // Validate that end date is after or equal to start date
  const startDate = new Date(data.dateDebut);
  const endDate = new Date(data.dateFin);
  return endDate >= startDate;
}, {
  message: "La date de fin doit être postérieure ou égale à la date de début",
  path: ["dateFin"],
})
.refine((data) => {
  // Validate company fields when typeClient is 'Societe'
  if (data.typeClient === ClientType.SOCIETE) {
    return data.siret && data.siret.length > 0 && data.nomSociete && data.nomSociete.length > 0;
  }
  return true;
}, {
  message: "SIRET et nom de société sont requis pour les entreprises",
  path: ["siret"],
});

/**
 * Schema for formation search validation
 */
export const formationSearchSchema = z.object({
  query: z
    .string()
    .min(2, "Minimum 2 caractères requis pour la recherche")
    .max(100, "Recherche trop longue"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20),
});

/**
 * Schema for individual field validation (using base schema for shape access)
 */
export const fieldValidationSchemas = {
  nom: baseProspectSchema.shape.nom,
  prenom: baseProspectSchema.shape.prenom,
  email: baseProspectSchema.shape.email,
  telephone: baseProspectSchema.shape.telephone,
  adresseLigne1: baseProspectSchema.shape.adresseLigne1,
  adresseLigne2: baseProspectSchema.shape.adresseLigne2,
  codePostal: baseProspectSchema.shape.codePostal,
  ville: baseProspectSchema.shape.ville,
  formationId: baseProspectSchema.shape.formationId,
  formationNom: baseProspectSchema.shape.formationNom,
  dureeHeures: baseProspectSchema.shape.dureeHeures,
  nombreParticipants: baseProspectSchema.shape.nombreParticipants,
  derouleHoraire: baseProspectSchema.shape.derouleHoraire,
  tarifTTC: baseProspectSchema.shape.tarifTTC,
  dateDebut: baseProspectSchema.shape.dateDebut,
  dateFin: baseProspectSchema.shape.dateFin,
  typeClient: baseProspectSchema.shape.typeClient,
  siret: baseProspectSchema.shape.siret,
  nomSociete: baseProspectSchema.shape.nomSociete,
  fonctionBeneficiaire: baseProspectSchema.shape.fonctionBeneficiaire,
} as const;

/**
 * Type inference from the validation schema
 */
export type ProspectFormData = z.infer<typeof prospectValidationSchema>;

/**
 * Default values for prospect form
 */
export const defaultProspectFormValues: Partial<ProspectFormData> = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresseLigne1: '',
  adresseLigne2: '',
  codePostal: '',
  ville: '',
  formationId: '',
  formationNom: '',
  dureeHeures: 7,
  nombreParticipants: 1,
  derouleHoraire: '',
  tarifTTC: 0,
  dateDebut: '',
  dateFin: '',
  typeClient: ClientType.INDIVIDU,
  siret: '',
  nomSociete: '',
  fonctionBeneficiaire: '',
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate a single field
   */
  validateField: (fieldName: keyof typeof fieldValidationSchemas, value: unknown) => {
    try {
      const schema = fieldValidationSchemas[fieldName];
      schema.parse(value);
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Validation error',
        };
      }
      return { isValid: false, error: 'Unknown validation error' };
    }
  },

  /**
   * Validate formation search query
   */
  validateFormationSearch: (query: string, limit?: number) => {
    try {
      formationSearchSchema.parse({ query, limit });
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Search validation error',
        };
      }
      return { isValid: false, error: 'Unknown search validation error' };
    }
  },

  /**
   * Validate full prospect form
   */
  validateProspectForm: (data: unknown) => {
    try {
      prospectValidationSchema.parse(data);
      return { isValid: true, error: null, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Form validation error',
          errors: error.errors,
        };
      }
      return { isValid: false, error: 'Unknown form validation error' };
    }
  },
};