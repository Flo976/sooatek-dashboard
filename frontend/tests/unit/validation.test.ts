/**
 * Unit tests for validation edge cases
 * Tests complex validation scenarios and edge cases
 */

import { describe, it, expect } from '@jest/globals';
import { phoneValidator, postalCodeValidator, siretValidator, dateValidator, fieldValidator } from '@/components/prospects/FieldValidators';
import { ClientType } from '@/types/prospect';

describe('Phone Validation Edge Cases', () => {
  describe('phoneValidator.validate', () => {
    it('should handle international numbers correctly', () => {
      expect(phoneValidator.validate('+33612345678').isValid).toBe(true);
      expect(phoneValidator.validate('+1234567890').isValid).toBe(true);
      expect(phoneValidator.validate('+4478901234567').isValid).toBe(true);
    });

    it('should reject malformed international numbers', () => {
      expect(phoneValidator.validate('+').isValid).toBe(false);
      expect(phoneValidator.validate('+33').isValid).toBe(false);
      expect(phoneValidator.validate('+336').isValid).toBe(false);
    });

    it('should handle French mobile numbers', () => {
      expect(phoneValidator.validate('0612345678').isValid).toBe(true);
      expect(phoneValidator.validate('0712345678').isValid).toBe(true);
      expect(phoneValidator.validate('06 12 34 56 78').isValid).toBe(true);
    });

    it('should handle French landline numbers', () => {
      expect(phoneValidator.validate('0123456789').isValid).toBe(true);
      expect(phoneValidator.validate('01 23 45 67 89').isValid).toBe(true);
      expect(phoneValidator.validate('0323456789').isValid).toBe(true);
    });

    it('should reject invalid French numbers', () => {
      expect(phoneValidator.validate('123456789').isValid).toBe(false); // Too short
      expect(phoneValidator.validate('12345678901').isValid).toBe(false); // Too long
      expect(phoneValidator.validate('0912345678').isValid).toBe(false); // Invalid prefix
    });
  });

  describe('phoneValidator.format', () => {
    it('should format French numbers correctly', () => {
      expect(phoneValidator.format('0612345678')).toBe('06 12 34 56 78');
      expect(phoneValidator.format('0123456789')).toBe('01 23 45 67 89');
    });

    it('should format international numbers', () => {
      expect(phoneValidator.format('+33612345678')).toBe('+33 6 12 34 56 78');
      expect(phoneValidator.format('+1234567890')).toBe('+1 234 567 890');
    });

    it('should handle already formatted numbers', () => {
      expect(phoneValidator.format('06 12 34 56 78')).toBe('06 12 34 56 78');
      expect(phoneValidator.format('+33 6 12 34 56 78')).toBe('+33 6 12 34 56 78');
    });
  });

  describe('phoneValidator.suggest', () => {
    it('should suggest French mobile format', () => {
      const suggestions = phoneValidator.suggest('6');
      expect(suggestions.some(s => s.includes('+33 6'))).toBe(true);
    });

    it('should suggest completion for partial numbers', () => {
      const suggestions = phoneValidator.suggest('061234');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return default suggestions for empty input', () => {
      const suggestions = phoneValidator.suggest('');
      expect(suggestions).toContain('+33 6 12 34 56 78');
      expect(suggestions).toContain('01 23 45 67 89');
    });
  });
});

describe('Postal Code Validation Edge Cases', () => {
  describe('postalCodeValidator.validate', () => {
    it('should accept valid French postal codes', () => {
      expect(postalCodeValidator.validate('75001').isValid).toBe(true);
      expect(postalCodeValidator.validate('13001').isValid).toBe(true);
      expect(postalCodeValidator.validate('69001').isValid).toBe(true);
    });

    it('should reject invalid postal codes', () => {
      expect(postalCodeValidator.validate('1234').isValid).toBe(false); // Too short
      expect(postalCodeValidator.validate('123456').isValid).toBe(false); // Too long
      expect(postalCodeValidator.validate('0000').isValid).toBe(false); // Too short
      expect(postalCodeValidator.validate('ABCDE').isValid).toBe(false); // Non-numeric
    });

    it('should format postal codes correctly', () => {
      expect(postalCodeValidator.format('75001')).toBe('75001');
      expect(postalCodeValidator.format('7500a1')).toBe('75001'); // Remove non-digits
      expect(postalCodeValidator.format('750019999')).toBe('75001'); // Truncate
    });
  });

  describe('postalCodeValidator.getDepartment', () => {
    it('should return correct departments for major cities', () => {
      expect(postalCodeValidator.getDepartment('75001')).toBe('Paris');
      expect(postalCodeValidator.getDepartment('13001')).toBe('Bouches-du-Rhône');
      expect(postalCodeValidator.getDepartment('69001')).toBe('Rhône');
      expect(postalCodeValidator.getDepartment('33000')).toBe('Gironde');
    });

    it('should handle edge cases', () => {
      expect(postalCodeValidator.getDepartment('99999')).toBe(null); // Invalid department
      expect(postalCodeValidator.getDepartment('1')).toBe(null); // Too short
      expect(postalCodeValidator.getDepartment('')).toBe(null); // Empty
    });
  });
});

describe('SIRET Validation Edge Cases', () => {
  describe('siretValidator.validate', () => {
    it('should accept valid SIRET numbers', () => {
      // Using a known valid SIRET: 73282932000074
      expect(siretValidator.validate('73282932000074').isValid).toBe(true);
      expect(siretValidator.validate('732 829 320 00074').isValid).toBe(true);
    });

    it('should reject invalid SIRET numbers', () => {
      expect(siretValidator.validate('12345678901234').isValid).toBe(false); // Wrong checksum
      expect(siretValidator.validate('1234567890123').isValid).toBe(false); // Too short
      expect(siretValidator.validate('123456789012345').isValid).toBe(false); // Too long
      expect(siretValidator.validate('ABCDEFGHIJKLMN').isValid).toBe(false); // Non-numeric
    });

    it('should format SIRET numbers correctly', () => {
      expect(siretValidator.format('73282932000074')).toBe('732 829 320 00074');
      expect(siretValidator.format('732A829B320C00074')).toBe('732 829 320 00074'); // Remove non-digits
    });
  });

  describe('siretValidator.isValidSiret', () => {
    it('should validate checksum correctly', () => {
      expect(siretValidator.isValidSiret('73282932000074')).toBe(true);
      expect(siretValidator.isValidSiret('12345678901234')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(siretValidator.isValidSiret('')).toBe(false);
      expect(siretValidator.isValidSiret('123')).toBe(false);
      expect(siretValidator.isValidSiret('1234567890123456')).toBe(false);
    });
  });

  describe('siretValidator.getSiren', () => {
    it('should extract SIREN correctly', () => {
      expect(siretValidator.getSiren('73282932000074')).toBe('732829320');
      expect(siretValidator.getSiren('732 829 320 00074')).toBe('732829320');
    });
  });
});

describe('Date Validation Edge Cases', () => {
  describe('dateValidator.validateRange', () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    it('should accept valid future date ranges', () => {
      const result = dateValidator.validateRange(
        tomorrow.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0]
      );
      expect(result.isValid).toBe(true);
    });

    it('should reject end date before start date', () => {
      const result = dateValidator.validateRange(
        nextWeek.toISOString().split('T')[0],
        tomorrow.toISOString().split('T')[0]
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('postérieure');
    });

    it('should reject past start dates', () => {
      const result = dateValidator.validateRange(
        yesterday.toISOString().split('T')[0],
        tomorrow.toISOString().split('T')[0]
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('passé');
    });

    it('should reject invalid date formats', () => {
      expect(dateValidator.validateRange('invalid', '2024-12-31').isValid).toBe(false);
      expect(dateValidator.validateRange('2024-12-31', 'invalid').isValid).toBe(false);
    });
  });

  describe('dateValidator.calculateDuration', () => {
    it('should calculate duration correctly', () => {
      expect(dateValidator.calculateDuration('2024-01-01', '2024-01-01')).toBe(1); // Same day
      expect(dateValidator.calculateDuration('2024-01-01', '2024-01-02')).toBe(2); // Two days
      expect(dateValidator.calculateDuration('2024-01-01', '2024-01-07')).toBe(7); // One week
    });

    it('should handle invalid dates', () => {
      expect(dateValidator.calculateDuration('invalid', '2024-01-01')).toBe(0);
      expect(dateValidator.calculateDuration('2024-01-01', 'invalid')).toBe(0);
    });
  });

  describe('dateValidator.formatForDisplay', () => {
    it('should format dates in French locale', () => {
      const formatted = dateValidator.formatForDisplay('2024-01-01');
      expect(formatted).toContain('janvier');
      expect(formatted).toContain('2024');
    });

    it('should handle invalid dates gracefully', () => {
      expect(dateValidator.formatForDisplay('invalid')).toBe('invalid');
    });
  });
});

describe('Field Validator Edge Cases', () => {
  describe('fieldValidator.validate', () => {
    it('should handle company fields based on client type', () => {
      // SIRET required for companies
      const siretResult = fieldValidator.validate('siret', '73282932000074', {
        typeClient: ClientType.SOCIETE
      });
      expect(siretResult.isValid).toBe(true);

      // SIRET not required for individuals
      const siretIndividualResult = fieldValidator.validate('siret', '', {
        typeClient: ClientType.INDIVIDU
      });
      expect(siretIndividualResult.isValid).toBe(true);
    });

    it('should validate phone numbers with special formatting', () => {
      const phoneResult = fieldValidator.validate('telephone', '+33 6 12 34 56 78');
      expect(phoneResult.isValid).toBe(true);
    });

    it('should validate postal codes with formatting', () => {
      const postalResult = fieldValidator.validate('codePostal', '75001');
      expect(postalResult.isValid).toBe(true);
    });

    it('should handle validation errors gracefully', () => {
      const invalidResult = fieldValidator.validate('telephone', 'invalid-phone');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });
  });

  describe('fieldValidator.getSuggestions', () => {
    it('should provide phone suggestions', () => {
      const suggestions = fieldValidator.getSuggestions('telephone', '06');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should provide function suggestions', () => {
      const suggestions = fieldValidator.getSuggestions('fonctionBeneficiaire', 'dev');
      expect(suggestions.some(s => s.toLowerCase().includes('dev'))).toBe(true);
    });

    it('should return empty array for unsupported fields', () => {
      const suggestions = fieldValidator.getSuggestions('nom', 'test');
      expect(suggestions).toEqual([]);
    });

    it('should filter suggestions based on input', () => {
      const allSuggestions = fieldValidator.getSuggestions('fonctionBeneficiaire', '');
      const filteredSuggestions = fieldValidator.getSuggestions('fonctionBeneficiaire', 'chef');

      expect(filteredSuggestions.length).toBeLessThan(allSuggestions.length);
      expect(filteredSuggestions.every(s => s.toLowerCase().includes('chef'))).toBe(true);
    });
  });
});

describe('Complex Validation Scenarios', () => {
  it('should handle multiple validation errors', () => {
    const phoneResult = fieldValidator.validate('telephone', 'invalid');
    const siretResult = fieldValidator.validate('siret', '12345', { typeClient: ClientType.SOCIETE });

    expect(phoneResult.isValid).toBe(false);
    expect(siretResult.isValid).toBe(false);
    expect(phoneResult.error).toBeDefined();
    expect(siretResult.error).toBeDefined();
  });

  it('should handle empty values appropriately', () => {
    const phoneResult = fieldValidator.validate('telephone', '');
    const optionalResult = fieldValidator.validate('siret', '', { typeClient: ClientType.INDIVIDU });

    expect(phoneResult.isValid).toBe(false); // Phone is required
    expect(optionalResult.isValid).toBe(true); // SIRET not required for individuals
  });

  it('should handle whitespace-only values', () => {
    const phoneResult = fieldValidator.validate('telephone', '   ');
    const postalResult = fieldValidator.validate('codePostal', ' \t ');

    expect(phoneResult.isValid).toBe(false);
    expect(postalResult.isValid).toBe(false);
  });

  it('should handle very long inputs', () => {
    const longPhone = '0'.repeat(100);
    const longSiret = '1'.repeat(100);

    const phoneResult = fieldValidator.validate('telephone', longPhone);
    const siretResult = fieldValidator.validate('siret', longSiret, { typeClient: ClientType.SOCIETE });

    expect(phoneResult.isValid).toBe(false);
    expect(siretResult.isValid).toBe(false);
  });
});