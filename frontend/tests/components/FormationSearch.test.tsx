/**
 * Component tests for FormationSearch dropdown
 * Tests search functionality, caching, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { FormationSearch } from '@/components/prospects/FormationSearch';
import type { Formation } from '@/types/formation';

// Mock the formations API
jest.mock('@/lib/api/formations', () => ({
  searchFormations: jest.fn(),
}));

// Mock shadcn components
jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}));

const mockSearchFormations = require('@/lib/api/formations').searchFormations;

const mockFormations: Formation[] = [
  {
    id: 'formation-1',
    nom: 'Formation React Avancé',
    description: 'Formation approfondie sur React',
    categorie: 'Développement Web',
    dureeStandard: 35,
  },
  {
    id: 'formation-2',
    nom: 'Formation TypeScript',
    description: 'Maîtrisez TypeScript',
    categorie: 'Développement Web',
    dureeStandard: 28,
  },
  {
    id: 'formation-3',
    nom: 'Formation Node.js',
    description: 'Backend avec Node.js',
    categorie: 'Développement Backend',
    dureeStandard: 42,
  },
];

describe('FormationSearch Component', () => {
  const user = userEvent.setup();
  const mockOnSelect = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchFormations.mockResolvedValue({
      formations: mockFormations,
      total: mockFormations.length,
      hasMore: false,
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
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      // Act
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);

      // Assert
      expect(screen.getByPlaceholderText(/rechercher une formation/i)).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      // Act
      render(
        <FormationSearch
          onSelect={mockOnSelect}
          onClear={mockOnClear}
          placeholder="Tapez votre formation"
        />
      );

      // Assert
      expect(screen.getByPlaceholderText('Tapez votre formation')).toBeInTheDocument();
    });

    it('should show selected formation when provided', () => {
      // Act
      render(
        <FormationSearch
          onSelect={mockOnSelect}
          onClear={mockOnClear}
          selectedFormation={mockFormations[0]}
        />
      );

      // Assert
      expect(screen.getByDisplayValue('Formation React Avancé')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should trigger search after minimum characters', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'react');

      // Assert
      await waitFor(() => {
        expect(mockSearchFormations).toHaveBeenCalledWith({
          query: 'react',
          limit: 20,
        });
      }, { timeout: 500 }); // Account for debounce
    });

    it('should not search with less than 2 characters', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'r');

      // Wait to ensure debounce doesn't trigger
      await new Promise(resolve => setTimeout(resolve, 400));

      // Assert
      expect(mockSearchFormations).not.toHaveBeenCalled();
    });

    it('should debounce search requests', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act - Type multiple characters quickly
      await user.type(searchInput, 'react');

      // Assert - Should only call once after debounce
      await waitFor(() => {
        expect(mockSearchFormations).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
    });

    it('should show loading state during search', async () => {
      // Arrange
      mockSearchFormations.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          formations: mockFormations,
          total: mockFormations.length,
          hasMore: false,
        }), 100))
      );

      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'react');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Dropdown Results', () => {
    it('should display search results', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
        expect(screen.getByText('Formation TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Formation Node.js')).toBeInTheDocument();
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      mockSearchFormations.mockResolvedValue({
        formations: [],
        total: 0,
        hasMore: false,
      });

      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'nonexistent');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/aucune formation trouvée/i)).toBeInTheDocument();
      });
    });

    it('should show error message on search failure', async () => {
      // Arrange
      mockSearchFormations.mockRejectedValue(new Error('Network error'));

      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'test');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/erreur lors de la recherche/i)).toBeInTheDocument();
      });
    });

    it('should limit displayed results', async () => {
      // Arrange
      const manyFormations = Array(30).fill(null).map((_, i) => ({
        id: `formation-${i}`,
        nom: `Formation ${i}`,
      }));

      mockSearchFormations.mockResolvedValue({
        formations: manyFormations,
        total: manyFormations.length,
        hasMore: true,
      });

      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} maxResults={20} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');

      // Assert
      await waitFor(() => {
        const formationItems = screen.getAllByText(/Formation \d+/);
        expect(formationItems).toHaveLength(20);
      });
    });
  });

  describe('Selection Behavior', () => {
    it('should call onSelect when formation is clicked', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Formation React Avancé'));

      // Assert
      expect(mockOnSelect).toHaveBeenCalledWith(mockFormations[0]);
    });

    it('should update input value after selection', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Formation React Avancé'));

      // Assert
      expect(searchInput).toHaveValue('Formation React Avancé');
    });

    it('should close dropdown after selection', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Formation React Avancé'));

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Formation TypeScript')).not.toBeInTheDocument();
      });
    });

    it('should clear selection when clear button is clicked', async () => {
      // Arrange
      render(
        <FormationSearch
          onSelect={mockOnSelect}
          onClear={mockOnClear}
          selectedFormation={mockFormations[0]}
        />
      );

      // Act
      const clearButton = screen.getByRole('button', { name: /effacer/i });
      await user.click(clearButton);

      // Assert
      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate results with arrow keys', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');

      // Assert
      const firstItem = screen.getByText('Formation React Avancé');
      expect(firstItem).toHaveClass('highlighted'); // Assuming CSS class
    });

    it('should select formation with Enter key', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // Assert
      expect(mockOnSelect).toHaveBeenCalledWith(mockFormations[0]);
    });

    it('should close dropdown with Escape key', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Formation React Avancé')).not.toBeInTheDocument();
      });
    });
  });

  describe('Caching', () => {
    it('should cache search results', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'react');
      await waitFor(() => {
        expect(mockSearchFormations).toHaveBeenCalledTimes(1);
      });

      // Clear and search again
      await user.clear(searchInput);
      await user.type(searchInput, 'react');

      // Assert - Should use cache, not call API again
      expect(mockSearchFormations).toHaveBeenCalledTimes(1);
    });

    it('should indicate when results are from cache', async () => {
      // Arrange
      const mockGetItem = jest.spyOn(window.sessionStorage, 'getItem');
      mockGetItem.mockReturnValue(JSON.stringify({
        query: 'react',
        results: mockFormations,
        timestamp: Date.now(),
        expiresAt: Date.now() + 300000,
      }));

      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'react');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/résultats en cache/i)).toBeInTheDocument();
      });
    });

    it('should handle cache expiration', async () => {
      // Arrange
      const mockGetItem = jest.spyOn(window.sessionStorage, 'getItem');
      mockGetItem.mockReturnValue(JSON.stringify({
        query: 'react',
        results: mockFormations,
        timestamp: Date.now() - 400000, // Expired
        expiresAt: Date.now() - 100000,
      }));

      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'react');

      // Assert - Should call API despite cache
      await waitFor(() => {
        expect(mockSearchFormations).toHaveBeenCalled();
      });
    });
  });

  describe('Error Fallback', () => {
    it('should use cached results when API fails', async () => {
      // Arrange
      const mockGetItem = jest.spyOn(window.sessionStorage, 'getItem');
      mockGetItem.mockReturnValue(JSON.stringify({
        query: 'react',
        results: mockFormations,
        timestamp: Date.now(),
        expiresAt: Date.now() + 300000,
      }));

      mockSearchFormations.mockRejectedValue(new Error('Network error'));

      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'react');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
        expect(screen.getByText(/résultats en cache/i)).toBeInTheDocument();
      });
    });

    it('should show error when no cache is available', async () => {
      // Arrange
      mockSearchFormations.mockRejectedValue(new Error('Network error'));
      const mockGetItem = jest.spyOn(window.sessionStorage, 'getItem');
      mockGetItem.mockReturnValue(null);

      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'react');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/erreur lors de la recherche/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Act
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);

      // Assert
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);
      expect(searchInput).toHaveAttribute('role', 'combobox');
      expect(searchInput).toHaveAttribute('aria-expanded', 'false');
      expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');

      // Assert
      await waitFor(() => {
        expect(searchInput).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should announce selection to screen readers', async () => {
      // Arrange
      render(<FormationSearch onSelect={mockOnSelect} onClear={mockOnClear} />);
      const searchInput = screen.getByPlaceholderText(/rechercher une formation/i);

      // Act
      await user.type(searchInput, 'formation');
      await waitFor(() => {
        expect(screen.getByText('Formation React Avancé')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Formation React Avancé'));

      // Assert
      expect(screen.getByRole('status')).toHaveTextContent(/formation sélectionnée/i);
    });
  });
});