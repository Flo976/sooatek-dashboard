/**
 * Field validation utilities for prospect form
 * Provides real-time validation and formatting functions
 */

import { z } from 'zod';
import { fieldValidationSchemas, validationUtils } from '@/lib/validation/prospect-schema';
import { ClientType } from '@/types/prospect';
import type { FieldValidationState, ProspectFormFieldName } from '@/types/prospect';

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Phone number formatting and validation
 */
export const phoneValidator = {
  /**
   * Format phone number for display
   */
  format(value: string): string {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');

    // If starts with +33, format as French number
    if (cleaned.startsWith('+33')) {
      const number = cleaned.slice(3);
      if (number.length >= 9) {
        return `+33 ${number.slice(0, 1)} ${number.slice(1, 3)} ${number.slice(3, 5)} ${number.slice(5, 7)} ${number.slice(7, 9)}`;
      }
    }

    // For other international formats, just add spaces every 3 digits
    if (cleaned.startsWith('+')) {
      const country = cleaned.match(/^\+\d{1,3}/)?.[0] || '';
      const number = cleaned.slice(country.length);
      const formatted = number.replace(/(\d{3})/g, '$1 ').trim();
      return `${country} ${formatted}`;
    }

    // For French numbers without country code
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }

    return cleaned;
  },

  /**
   * Validate phone number
   */
  validate(value: string): ValidationResult {
    try {
      fieldValidationSchemas.telephone.parse(value);
      return {
        isValid: true,
        formatted: this.format(value),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Format invalide',
        };
      }
      return {
        isValid: false,
        error: 'Format invalide',
      };
    }
  },

  /**
   * Suggest phone format based on partial input
   */
  suggest(value: string): string[] {
    const cleaned = value.replace(/[^\d]/g, '');

    if (cleaned.length === 0) {
      return ['+33 6 12 34 56 78', '01 23 45 67 89'];
    }

    if (cleaned.startsWith('0') && cleaned.length <= 10) {
      return [`${cleaned.padEnd(10, '·').replace(/(\d{2})/g, '$1 ').trim()}`];
    }

    if (cleaned.startsWith('6') || cleaned.startsWith('7')) {
      return [`+33 ${cleaned.padEnd(9, '·').replace(/(\d{1})(\d{2})/g, '$1 $2 ').trim()}`];
    }

    return [];
  },
};

/**
 * Postal code validation for French addresses
 */
export const postalCodeValidator = {
  /**
   * Format postal code
   */
  format(value: string): string {
    return value.replace(/\D/g, '').slice(0, 5);
  },

  /**
   * Validate postal code
   */
  validate(value: string): ValidationResult {
    try {
      fieldValidationSchemas.codePostal.parse(value);
      return {
        isValid: true,
        formatted: this.format(value),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Code postal invalide',
        };
      }
      return {
        isValid: false,
        error: 'Code postal invalide',
      };
    }
  },

  /**
   * Get department from postal code
   */
  getDepartment(postalCode: string): string | null {
    if (postalCode.length < 2) return null;

    const deptCode = postalCode.slice(0, 2);
    const departments: Record<string, string> = {
      '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
      '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
      '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône',
      '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime',
      '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor',
      '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
      '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
      '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
      '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura', '40': 'Landes',
      '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique',
      '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
      '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
      '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
      '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
      '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
      '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
      '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
      '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
      '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
      '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne',
      '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort', '91': 'Essonne',
      '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
    };

    return departments[deptCode] || null;
  },
};

/**
 * SIRET validation for French companies
 */
export const siretValidator = {
  /**
   * Format SIRET number
   */
  format(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 14) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/g, '$1 $2 $3 $4').trim();
    }
    return cleaned.slice(0, 14);
  },

  /**
   * Validate SIRET number
   */
  validate(value: string): ValidationResult {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length !== 14) {
      return {
        isValid: false,
        error: 'Le SIRET doit contenir exactement 14 chiffres',
      };
    }

    // Basic SIRET checksum validation
    if (!this.isValidSiret(cleaned)) {
      return {
        isValid: false,
        error: 'Numéro SIRET invalide (clé de contrôle incorrecte)',
      };
    }

    return {
      isValid: true,
      formatted: this.format(value),
    };
  },

  /**
   * Validate SIRET checksum
   */
  isValidSiret(siret: string): boolean {
    if (siret.length !== 14) return false;

    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(siret[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }

    return sum % 10 === 0;
  },

  /**
   * Extract SIREN from SIRET
   */
  getSiren(siret: string): string {
    const cleaned = siret.replace(/\D/g, '');
    return cleaned.slice(0, 9);
  },
};

/**
 * Date validation utilities
 */
export const dateValidator = {
  /**
   * Validate date and date range
   */
  validateRange(startDate: string, endDate: string): ValidationResult {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return {
        isValid: false,
        error: 'Date de début invalide',
      };
    }

    if (isNaN(end.getTime())) {
      return {
        isValid: false,
        error: 'Date de fin invalide',
      };
    }

    if (end < start) {
      return {
        isValid: false,
        error: 'La date de fin doit être postérieure à la date de début',
      };
    }

    // Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return {
        isValid: false,
        error: 'La date de début ne peut pas être dans le passé',
      };
    }

    return { isValid: true };
  },

  /**
   * Calculate duration between dates
   */
  calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  },

  /**
   * Format date for display
   */
  formatForDisplay(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  },
};

/**
 * Generic field validator
 */
export const fieldValidator = {
  /**
   * Validate any form field
   */
  validate<T extends ProspectFormFieldName>(
    fieldName: T,
    value: unknown,
    context?: { typeClient?: string }
  ): FieldValidationState {
    try {
      // Special handling for company fields
      if (fieldName === 'siret' || fieldName === 'nomSociete') {
        if (context?.typeClient !== ClientType.SOCIETE) {
          return { isValid: true, isTouched: false };
        }

        if (fieldName === 'siret' && typeof value === 'string') {
          const result = siretValidator.validate(value);
          return {
            isValid: result.isValid,
            error: result.error,
            isTouched: true,
          };
        }
      }

      // Special handling for phone numbers
      if (fieldName === 'telephone' && typeof value === 'string') {
        const result = phoneValidator.validate(value);
        return {
          isValid: result.isValid,
          error: result.error,
          isTouched: true,
        };
      }

      // Special handling for postal codes
      if (fieldName === 'codePostal' && typeof value === 'string') {
        const result = postalCodeValidator.validate(value);
        return {
          isValid: result.isValid,
          error: result.error,
          isTouched: true,
        };
      }

      // Use Zod validation for other fields
      const result = validationUtils.validateField(fieldName, value);
      return {
        isValid: result.isValid,
        error: result.error || undefined,
        isTouched: true,
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Erreur de validation',
        isTouched: true,
      };
    }
  },

  /**
   * Get field suggestions/autocomplete
   */
  getSuggestions(fieldName: ProspectFormFieldName, value: string): string[] {
    switch (fieldName) {
      case 'telephone':
        return phoneValidator.suggest(value);

      case 'ville':
        // Could be extended with city suggestions based on postal code
        return [];

      case 'fonctionBeneficiaire':
        return [
          'Développeur',
          'Chef de projet',
          'Consultant',
          'Formateur',
          'Responsable technique',
          'Directeur',
        ].filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );

      default:
        return [];
    }
  },
};

/**
 * Export all validators for easy access
 */
export default {
  phone: phoneValidator,
  postalCode: postalCodeValidator,
  siret: siretValidator,
  date: dateValidator,
  field: fieldValidator,
};