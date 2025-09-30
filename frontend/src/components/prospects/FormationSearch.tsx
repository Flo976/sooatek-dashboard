/**
 * Formation search component with caching
 * Provides searchable dropdown for formation selection
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchFormations, isResultFromCache } from '@/lib/api/formations';
import type { Formation, FormationSearchState, UseFormationSearchReturn } from '@/types/formation';

interface FormationSearchProps {
  onSelect: (formation: Formation) => void;
  onClear: () => void;
  selectedFormation?: Formation;
  placeholder?: string;
  maxResults?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Custom hook for formation search logic
 */
function useFormationSearch(): UseFormationSearchReturn {
  const [state, setState] = useState<FormationSearchState>({
    query: '',
    results: [],
    isLoading: false,
    isOpen: false,
    error: undefined,
    selectedFormation: undefined,
    isCached: false,
  });

  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const search = useCallback(async (query: string) => {
    // Clear existing timeout and abort ongoing requests
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search if query is too short
    if (query.length < 2) {
      setState(prev => ({
        ...prev,
        query,
        results: [],
        isOpen: false,
        error: undefined,
      }));
      return;
    }

    // Update query immediately
    setState(prev => ({ ...prev, query, error: undefined }));

    // Debounce the actual search
    debounceRef.current = setTimeout(async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, isOpen: true }));

        const response = await searchFormations({ query, limit: 20 });
        const isCached = isResultFromCache(query);

        setState(prev => ({
          ...prev,
          results: response.formations,
          isLoading: false,
          isCached,
          error: undefined,
        }));

        // Show cache fallback notification if applicable
        if (isCached && response.formations.length > 0) {
          console.info('Using cached formation results due to service unavailability');
        }
      } catch (error) {
        console.error('Formation search error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur lors de la recherche',
        }));
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      isOpen: false,
      selectedFormation: undefined,
      error: undefined,
    }));
  }, []);

  const selectFormation = useCallback((formation: Formation) => {
    setState(prev => ({
      ...prev,
      selectedFormation: formation,
      query: formation.nom,
      isOpen: false,
      results: [],
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFormation: undefined,
      query: '',
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    state,
    search,
    clear,
    selectFormation,
    clearSelection,
  };
}

/**
 * Formation search dropdown component
 */
export function FormationSearch({
  onSelect,
  onClear,
  selectedFormation,
  placeholder = 'Rechercher une formation...',
  maxResults = 20,
  disabled = false,
  className = '',
}: FormationSearchProps) {
  const { state, search, clear, selectFormation, clearSelection } = useFormationSearch();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external selected formation
  useEffect(() => {
    if (selectedFormation && selectedFormation !== state.selectedFormation) {
      selectFormation(selectedFormation);
    }
  }, [selectedFormation, state.selectedFormation, selectFormation]);

  // Handle formation selection
  const handleSelect = useCallback((formation: Formation) => {
    selectFormation(formation);
    onSelect(formation);
    setHighlightedIndex(-1);
  }, [selectFormation, onSelect]);

  // Handle clear
  const handleClear = useCallback(() => {
    clearSelection();
    onClear();
    setHighlightedIndex(-1);
  }, [clearSelection, onClear]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    search(value);
    setHighlightedIndex(-1);
  }, [search]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!state.isOpen || state.results.length === 0) {
      if (e.key === 'ArrowDown' && state.query.length >= 2) {
        search(state.query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < state.results.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : state.results.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < state.results.length) {
          handleSelect(state.results[highlightedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setState(prev => ({ ...prev, isOpen: false }));
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setState(prev => ({ ...prev, isOpen: false }));
        setHighlightedIndex(-1);
        break;
    }
  }, [state.isOpen, state.results, state.query, highlightedIndex, handleSelect, search]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setState(prev => ({ ...prev, isOpen: false }));
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limit displayed results
  const displayedResults = state.results.slice(0, maxResults);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input with icons */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {state.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" data-testid="loader-icon" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" data-testid="search-icon" />
          )}
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={state.query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
          role="combobox"
          aria-expanded={state.isOpen}
          aria-autocomplete="list"
          aria-controls="formation-listbox"
          aria-activedescendant={
            highlightedIndex >= 0 ? `formation-option-${highlightedIndex}` : undefined
          }
        />

        {/* Clear button */}
        {(state.query || state.selectedFormation) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Effacer la sélection"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Dropdown arrow */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-muted-foreground" data-testid="chevron-down-icon" />
        </div>
      </div>

      {/* Dropdown results */}
      {state.isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Cache indicator */}
          {state.isCached && (
            <div className="px-3 py-2 text-xs text-blue-600 bg-blue-50 border-b">
              <span>📦 Résultats en cache</span>
              {state.error && (
                <div className="text-orange-600 mt-1">
                  ⚠️ Service indisponible - données mises en cache utilisées
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {state.isLoading && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Recherche en cours...
            </div>
          )}

          {/* Error state */}
          {state.error && (
            <div className="px-3 py-4 text-center text-sm text-red-600">
              <span>⚠️ {state.error}</span>
            </div>
          )}

          {/* Results */}
          {!state.isLoading && !state.error && (
            <>
              {displayedResults.length > 0 ? (
                <ul role="listbox" id="formation-listbox" className="py-1">
                  {displayedResults.map((formation, index) => (
                    <li
                      key={formation.id}
                      id={`formation-option-${index}`}
                      role="option"
                      aria-selected={index === highlightedIndex}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        index === highlightedIndex
                          ? 'bg-blue-50 text-blue-900 highlighted'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelect(formation)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="font-medium">{formation.nom}</div>
                      {formation.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {formation.description}
                        </div>
                      )}
                      {formation.dureeStandard && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Durée standard: {formation.dureeStandard}h
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                state.query.length >= 2 && (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    <span>🔍 Aucune formation trouvée</span>
                    <div className="text-xs mt-1">
                      Essayez avec d'autres mots-clés
                    </div>
                  </div>
                )
              )}

              {/* More results indicator */}
              {state.results.length > maxResults && (
                <div className="px-3 py-2 text-xs text-center text-muted-foreground border-t bg-gray-50">
                  +{state.results.length - maxResults} formations supplémentaires
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {state.selectedFormation && `Formation sélectionnée: ${state.selectedFormation.nom}`}
        {state.isLoading && 'Recherche en cours'}
        {state.error && `Erreur: ${state.error}`}
        {!state.isLoading && !state.error && state.results.length > 0 &&
          `${state.results.length} formation${state.results.length > 1 ? 's' : ''} trouvée${state.results.length > 1 ? 's' : ''}`}
      </div>
    </div>
  );
}