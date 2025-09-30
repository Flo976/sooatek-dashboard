# Feature Specification: Créer un Prospect - Formulaire de création de prospect

**Feature Branch**: `001-créé-une-page`
**Created**: 2025-09-27
**Status**: Draft
**Input**: User description: "Créé une page \"Créer un prospect\" à l'aide du formulaire @specs/form.json , la formation est un champ dynamique (dropdown avec recherche) récupérable via le webhook https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a qui renvoi un json type @specs/retour.json, la page de formulaire doit envoyer le contenu du formulaire à https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388 Pour créer les éléments de la page , il faut utiliser le mcp shadncn déja actif"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature identified: Prospect creation form page
2. Extract key concepts from description
   → Actors: Users creating prospects (commercial team)
   → Actions: Fill form, search formations, submit prospect data
   → Data: Prospect information, formation catalog
   → Constraints: Required fields validation, dynamic formation list
3. For each unclear aspect:
   → All critical clarifications have been resolved
4. Fill User Scenarios & Testing section
   → Clear user flow identified for prospect creation
5. Generate Functional Requirements
   → Each requirement is testable
   → Marked ambiguous requirements where needed
6. Identify Key Entities
   → Prospect, Formation, Address, Contact Info
7. Run Review Checklist
   → All critical clarifications resolved
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-09-27
- Q: What should happen immediately after a prospect is successfully created? → A: Show confirmation message and clear form for new entry
- Q: How should the system behave when the formation catalog service is unavailable? → A: Use cached formation list if available, else block
- Q: What phone number formats should the system accept? → A: International format with country codes
- Q: How should the system handle potential duplicate prospect submissions? → A: Allow all submissions without checking
- Q: What should happen to form data when a user navigates away without submitting? → A: Warn before leaving if data entered

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a commercial team member, I need to create prospect records with complete information about potential clients interested in training programs, so that we can track and manage our sales pipeline effectively.

### Acceptance Scenarios
1. **Given** a user is on the prospect creation page, **When** they fill all required fields with valid data and submit, **Then** the prospect is created and a confirmation is displayed
2. **Given** a user starts typing in the formation field, **When** they enter at least 2 characters, **Then** a searchable dropdown shows matching formations from the catalog
3. **Given** a user selects "Societe" as client type, **When** they continue filling the form, **Then** company-specific fields (SIRET, company name) become available
4. **Given** a user submits the form with missing required fields, **When** they click submit, **Then** validation errors highlight the missing fields
5. **Given** a user has successfully submitted a prospect, **When** the submission completes, **Then** a confirmation message is displayed and the form is cleared for new entry

### Edge Cases
- When formation catalog service is unavailable: System uses cached formation list if available, otherwise blocks form submission with appropriate error message
- Duplicate prospect submissions: System allows all submissions without duplicate checking
- User navigation: System warns before leaving page if form has unsaved data
- What occurs if user loses connection during form submission?
- Invalid phone formats: System validates international format with country codes, showing error for invalid patterns
- What happens with SIRET validation for company prospects?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST display a form with all fields defined in the prospect data model (formation, contact info, address, dates, pricing)
- **FR-002**: System MUST mark and validate all required fields before submission (nom, prénom, email, téléphone, adresse ligne 1, code postal, ville, durée, nombre participants, déroulé, tarif, dates, type client)
- **FR-003**: Formation field MUST provide dynamic search functionality with live results from the formation catalog
- **FR-004**: System MUST fetch available formations from external catalog service with minimum 2 characters typed, using cached data as fallback when service is unavailable
- **FR-005**: System MUST support different field types: text, number, date, textarea, dropdown with appropriate input controls
- **FR-006**: System MUST conditionally show/hide fields based on client type selection (Société fields only when relevant)
- **FR-007**: System MUST validate email format according to standard RFC 5322 specification
- **FR-008**: System MUST validate phone number format accepting international formats with country codes
- **FR-009**: System MUST validate postal code as 5-digit number for French addresses
- **FR-010**: System MUST validate SIRET as 14-digit number when provided
- **FR-011**: System MUST ensure end date is after or equal to start date
- **FR-012**: System MUST submit complete prospect data to processing service upon valid submission without duplicate checking
- **FR-013**: System MUST handle submission errors gracefully with user-friendly messages
- **FR-014**: System MUST provide clear feedback on successful prospect creation and clear the form for new entry
- **FR-015**: System MUST warn users before navigating away if form data has been entered but not submitted

### Key Entities *(include if feature involves data)*
- **Prospect**: Represents a potential client with personal/company information, training needs, and commercial data
  - Contact information (name, email, phone)
  - Address details
  - Training specifications (formation, duration, participants)
  - Financial information (pricing)
  - Client type (individual or company)

- **Formation**: Training program from catalog
  - Name/title
  - Identifier
  - Searchable via partial text match

- **Address**: Location information
  - Street lines (1 required, 2 optional)
  - Postal code (5 digits)
  - City

- **Training Details**: Specific training session information
  - Duration in hours
  - Number of participants
  - Schedule details (text description)
  - Start and end dates
  - Applied pricing

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

### Clarifications Resolved
All critical clarifications have been addressed through the clarification session:
1. Post-submission: Show confirmation and clear form for new entry
2. Formation service fallback: Use cached data when unavailable
3. Phone validation: Accept international formats with country codes
4. Duplicate detection: Allow all submissions without checking
5. Navigation warning: Alert users before leaving with unsaved data

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---