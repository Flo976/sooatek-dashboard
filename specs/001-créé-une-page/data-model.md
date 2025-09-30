# Data Model

## Core Entities

### Prospect
Primary entity representing a potential client interested in training programs.

```typescript
interface Prospect {
  // Contact Information
  nom: string;                    // Last name (required)
  prenom: string;                 // First name (required)
  email: string;                   // Email address (required, RFC 5322)
  telephone: string;               // Phone number (required, international format)

  // Address
  adresseLigne1: string;          // Address line 1 (required)
  adresseLigne2?: string;         // Address line 2 (optional)
  codePostal: string;             // Postal code (required, 5 digits)
  ville: string;                  // City (required)

  // Training Information
  formationId: string;            // Selected formation ID (required)
  formationNom: string;           // Formation name for display
  dureeHeures: number;            // Duration in hours (required, min: 1)
  nombreParticipants: number;     // Number of participants (required, min: 1)
  derouleHoraire: string;         // Schedule details (required, multiline text)

  // Financial
  tarifTTC: number;               // Price including tax in EUR (required, min: 0)

  // Dates
  dateDebut: string;              // Start date (required, ISO 8601)
  dateFin: string;                // End date (required, ISO 8601)

  // Client Type
  typeClient: 'Societe' | 'Individu';  // Client type (required)

  // Company Information (conditional)
  siret?: string;                 // SIRET number (14 digits, required if typeClient === 'Societe')
  nomSociete?: string;            // Company name (required if typeClient === 'Societe')
  fonctionBeneficiaire?: string;  // Beneficiary function (optional)

  // Metadata
  submittedAt?: string;           // Submission timestamp (ISO 8601)
  formMode?: 'test' | 'production'; // Form submission mode
}
```

### Formation
Training program available for selection.

```typescript
interface Formation {
  id: string;                     // Unique identifier
  nom: string;                    // Formation name/title
  description?: string;           // Optional description
  categorie?: string;            // Optional category
  dureeStandard?: number;        // Standard duration in hours
}
```

### FormationSearchResponse
API response structure for formation search.

```typescript
interface FormationSearchResponse {
  formations: Formation[];        // Array of matching formations
  total: number;                 // Total count
  hasMore: boolean;              // Pagination indicator
}
```

## Validation Rules

### Field Validations

```typescript
const prospectValidationSchema = {
  // Text fields
  nom: z.string().min(1, "Nom requis").max(100),
  prenom: z.string().min(1, "Prénom requis").max(100),

  // Contact
  email: z.string().email("Email invalide"),
  telephone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Format international requis"),

  // Address
  adresseLigne1: z.string().min(1, "Adresse requise").max(200),
  adresseLigne2: z.string().max(200).optional(),
  codePostal: z.string().regex(/^\d{5}$/, "Code postal à 5 chiffres requis"),
  ville: z.string().min(1, "Ville requise").max(100),

  // Training
  formationId: z.string().min(1, "Formation requise"),
  dureeHeures: z.number().min(1, "Durée minimum 1 heure").max(9999),
  nombreParticipants: z.number().min(1, "Minimum 1 participant").max(999),
  derouleHoraire: z.string().min(1, "Déroulé horaire requis").max(5000),

  // Financial
  tarifTTC: z.number().min(0, "Tarif invalide").max(999999),

  // Dates
  dateDebut: z.string().datetime(),
  dateFin: z.string().datetime(),

  // Client type
  typeClient: z.enum(['Societe', 'Individu']),

  // Conditional fields
  siret: z.string().regex(/^\d{14}$/, "SIRET à 14 chiffres").optional(),
  nomSociete: z.string().max(200).optional(),
  fonctionBeneficiaire: z.string().max(100).optional()
};
```

### Business Rules

1. **Date Validation**: `dateFin` must be greater than or equal to `dateDebut`
2. **Company Fields**: When `typeClient === 'Societe'`:
   - `siret` becomes required
   - `nomSociete` becomes required
   - Fields are shown in UI
3. **Formation Search**: Minimum 2 characters required to trigger search
4. **Navigation Guard**: Warn user if form has unsaved changes
5. **Duplicate Check**: No duplicate validation (all submissions allowed)

## State Transitions

### Form States
```
INITIAL → EDITING → VALIDATING → SUBMITTING → SUCCESS
            ↓           ↓            ↓
         ERROR ←────────┴────────────┘
```

### Field Visibility States
```
typeClient change →
  if 'Societe': SHOW company fields
  if 'Individu': HIDE company fields
```

### Formation Search States
```
IDLE → SEARCHING → RESULTS
         ↓
      ERROR → CACHED_RESULTS (fallback)
```

## API Contracts

### GET /webhook/formations (Search)
```typescript
// Request
interface FormationSearchRequest {
  query: string;      // Search term (min 2 chars)
  limit?: number;     // Results limit (default: 20)
}

// Response
interface FormationSearchResponse {
  formations: Formation[];
  total: number;
  hasMore: boolean;
}
```

### POST /webhook-test/prospect (Submit)
```typescript
// Request
interface ProspectSubmitRequest extends Prospect {
  // All Prospect fields
}

// Response
interface ProspectSubmitResponse {
  success: boolean;
  id?: string;         // Created prospect ID
  message?: string;    // Success/error message
  errors?: {          // Field-specific errors
    [field: string]: string;
  };
}
```

## Cache Strategy

### Formation Cache
- **Storage**: SessionStorage
- **Key**: `formations_cache_{query}`
- **TTL**: Session lifetime
- **Structure**:
```typescript
interface FormationCache {
  query: string;
  results: Formation[];
  timestamp: number;
  expiresAt: number;
}
```

### Form Data Cache
- **Storage**: SessionStorage
- **Key**: `prospect_form_draft`
- **TTL**: Session lifetime
- **Trigger**: On field blur (debounced 1s)
- **Clear**: On successful submission