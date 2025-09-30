# Quickstart Guide: Prospect Creation Form

## Overview
This guide walks through creating and testing the prospect creation form feature.

## Prerequisites
- Node.js 18+ and npm installed
- Access to the frontend directory
- Network access to external webhook services

## Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Ensure the following endpoints are accessible:
- Formation search: `https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a`
- Prospect submission: `https://formialab.app.n8n.cloud/webhook-test/3b0313cf-77a9-4954-9c43-c63681d63388`

## Development

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to Form
Open browser to: `http://localhost:3000/dashboard/prospects/create`

## Testing the Form

### Basic Form Submission
1. Fill in all required fields:
   - **Nom**: Dupont
   - **Prénom**: Jean
   - **Email**: jean.dupont@example.com
   - **Téléphone**: +33612345678
   - **Adresse**: 123 rue de la Paix
   - **Code Postal**: 75001
   - **Ville**: Paris
   - **Formation**: Type "formation" and select from dropdown
   - **Durée**: 35
   - **Participants**: 2
   - **Déroulé**: "Jour 1: Introduction\nJour 2: Pratique"
   - **Tarif**: 2500
   - **Date début**: Select today's date
   - **Date fin**: Select next week
   - **Type client**: Individu

2. Click "Envoyer" button
3. Verify success message appears
4. Confirm form is cleared

### Company Client Flow
1. Select "Societe" as Type client
2. Additional fields should appear:
   - **SIRET**: 12345678901234
   - **Nom société**: ACME Corp
3. Fill remaining fields and submit

### Formation Search
1. Click on Formation field
2. Type at least 2 characters: "for"
3. Verify dropdown appears with results
4. Select a formation from list

### Validation Testing
1. Try submitting empty form
   - Should highlight all required fields
2. Enter invalid email: "notanemail"
   - Should show email format error
3. Enter invalid postal code: "750"
   - Should show 5-digit requirement
4. Set end date before start date
   - Should show date validation error

### Error Scenarios

#### Network Failure
1. Disconnect network/use browser dev tools to block requests
2. Try searching formations
   - Should show cached results if available
   - Otherwise show error message
3. Try submitting form
   - Should show network error toast

#### Navigation Warning
1. Start filling the form
2. Try to navigate away or close tab
3. Verify browser warning appears

## Running Tests

### Unit Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Verification Checklist

### Functional Requirements
- [ ] All 18 form fields are present and functional
- [ ] Required field validation works
- [ ] Formation search with 2+ characters triggers API call
- [ ] Company fields show/hide based on client type
- [ ] Form submission sends data to webhook
- [ ] Success message and form clearing after submission
- [ ] Navigation warning for unsaved changes

### User Experience
- [ ] Form is responsive on mobile/tablet/desktop
- [ ] Error messages are clear and helpful
- [ ] Loading states during API calls
- [ ] Keyboard navigation works
- [ ] Tab order is logical

### Error Handling
- [ ] Network failures show appropriate messages
- [ ] Validation errors display inline
- [ ] API errors show toast notifications
- [ ] Formation service fallback to cache works

### Accessibility
- [ ] All fields have proper labels
- [ ] Error messages are announced
- [ ] Form is navigable with keyboard only
- [ ] Screen reader compatibility

## Troubleshooting

### Formation search not working
- Check network tab for API calls
- Verify webhook URL is accessible
- Check browser console for errors
- Clear session storage and retry

### Form not submitting
- Check all required fields are filled
- Verify validation passes (no red fields)
- Check network tab for POST request
- Review console for JavaScript errors

### Styles not loading
- Run `npm run dev` to rebuild
- Check shadcn components are installed
- Verify Tailwind configuration

## Production Build

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
```

### Verify Production
1. Test all form functionality
2. Check browser console for errors
3. Verify API endpoints are production URLs
4. Test error handling scenarios