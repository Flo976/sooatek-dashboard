/**
 * ProspectForm main component with React Hook Form
 * Complete prospect creation form with validation and submission
 */

'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormationSearch } from './FormationSearch';
import { submitProspect } from '@/lib/api/prospects';
import { prospectValidationSchema, defaultProspectFormValues } from '@/lib/validation/prospect-schema';
// import { fieldValidator } from './FieldValidators'; // Unused import
import { ClientType } from '@/types/prospect';
import type { ProspectFormData, Formation } from '@/types/prospect';

interface ProspectFormProps {
  onSuccess?: (prospectId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Main prospect form component
 */
export function ProspectForm({
  onSuccess,
  onError,
  className = '',
}: ProspectFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<ProspectFormData>({
    resolver: zodResolver(prospectValidationSchema),
    defaultValues: defaultProspectFormValues,
    mode: 'onBlur',
  });

  // Watch form values for conditional logic
  const typeClient = watch('typeClient');
  const formationId = watch('formationId');
  const dateDebut = watch('dateDebut');
  const dateFin = watch('dateFin');

  // Memoize expensive operations for performance
  const memoizedValidationResults = useMemo(() => {
    return {
      showCompanyFields: typeClient === ClientType.SOCIETE,
      typeClient,
      hasSelectedFormation: Boolean(formationId),
      hasDateRange: Boolean(dateDebut && dateFin),
      isFormComplete: Boolean(
        typeClient &&
        formationId &&
        dateDebut &&
        dateFin
      ),
    };
  }, [typeClient, formationId, dateDebut, dateFin]);

  const { showCompanyFields } = memoizedValidationResults;

  // Navigation guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // Auto-save to sessionStorage
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      const formData = watch();
      try {
        sessionStorage.setItem('prospect_form_draft', JSON.stringify(formData));
      } catch (error) {
        console.warn('Failed to auto-save form data:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [watch, isDirty]);

  // Restore form data from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('prospect_form_draft');
      if (saved) {
        const data = JSON.parse(saved);
        reset(data);
      }
    } catch (error) {
      console.warn('Failed to restore form data:', error);
    }
  }, [reset]);

  // Memoized formation selection handler
  const handleFormationSelect = useCallback((formation: Formation) => {
    setValue('formationId', formation.id, { shouldValidate: true });
    setValue('formationNom', formation.nom, { shouldValidate: true });

    // Auto-fill duration if available
    if (formation.dureeStandard) {
      setValue('dureeHeures', formation.dureeStandard, { shouldValidate: true });
    }
  }, [setValue]);

  // Memoized formation clear handler
  const handleFormationClear = useCallback(() => {
    setValue('formationId', '', { shouldValidate: true });
    setValue('formationNom', '', { shouldValidate: true });
  }, [setValue]);

  // Memoized form submission handler
  const onSubmit = useCallback(async (data: ProspectFormData) => {
    try {
      const result = await submitProspect(data);

      if (result.success) {
        toast.success('Prospect créé avec succès!');

        // Clear saved draft
        sessionStorage.removeItem('prospect_form_draft');

        // Reset form
        reset(defaultProspectFormValues);

        // Call success callback
        if (onSuccess && result.id) {
          onSuccess(result.id);
        }
      } else {
        throw new Error(result.message || 'Échec de la création du prospect');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi';
      toast.error(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [onSuccess, onError, reset]);

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Création d&apos;un prospect
        </h1>
        <p className="text-gray-600">
          Remplissez le formulaire ci-dessous pour créer un nouveau prospect de formation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Loading overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Envoi en cours...</span>
            </div>
          </div>
        )}
        {/* Contact Information Section */}
        <section className={`bg-white p-6 rounded-lg border border-gray-200 ${isSubmitting ? 'opacity-75 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations de contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </Label>
              <Input
                id="nom"
                {...register('nom')}
                placeholder="Nom de famille"
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!errors.nom}
              />
              {errors.nom && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.nom.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </Label>
              <Input
                id="prenom"
                {...register('prenom')}
                placeholder="Prénom"
                aria-required="true"
                aria-invalid={!!errors.prenom}
              />
              {errors.prenom && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.prenom.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemple.com"
                aria-required="true"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </Label>
              <Input
                id="telephone"
                type="tel"
                {...register('telephone')}
                placeholder="+33 6 12 34 56 78"
                aria-required="true"
                aria-invalid={!!errors.telephone}
              />
              {errors.telephone && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.telephone.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Address Section */}
        <section className={`bg-white p-6 rounded-lg border border-gray-200 ${isSubmitting ? 'opacity-75 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Adresse
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="adresseLigne1" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse ligne 1 *
              </Label>
              <Input
                id="adresseLigne1"
                {...register('adresseLigne1')}
                placeholder="Numéro et nom de rue"
                aria-required="true"
                aria-invalid={!!errors.adresseLigne1}
              />
              {errors.adresseLigne1 && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.adresseLigne1.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="adresseLigne2" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse ligne 2
              </Label>
              <Input
                id="adresseLigne2"
                {...register('adresseLigne2')}
                placeholder="Complément d'adresse (optionnel)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codePostal" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal *
                </Label>
                <Input
                  id="codePostal"
                  {...register('codePostal')}
                  placeholder="75001"
                  maxLength={5}
                  aria-required="true"
                  aria-invalid={!!errors.codePostal}
                />
                {errors.codePostal && (
                  <p role="alert" className="mt-1 text-sm text-red-600">
                    {errors.codePostal.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </Label>
                <Input
                  id="ville"
                  {...register('ville')}
                  placeholder="Paris"
                  aria-required="true"
                  aria-invalid={!!errors.ville}
                />
                {errors.ville && (
                  <p role="alert" className="mt-1 text-sm text-red-600">
                    {errors.ville.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Client Type Section */}
        <section className={`bg-white p-6 rounded-lg border border-gray-200 ${isSubmitting ? 'opacity-75 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Type de client
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="typeClient" className="block text-sm font-medium text-gray-700 mb-1">
                Type de client *
              </Label>
              <Controller
                name="typeClient"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="select">
                      <SelectValue placeholder="Sélectionnez le type de client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ClientType.INDIVIDU}>Individu</SelectItem>
                      <SelectItem value={ClientType.SOCIETE}>Societe</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.typeClient && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.typeClient.message}
                </p>
              )}
            </div>

            {/* Company fields - shown only for Societe */}
            {showCompanyFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <Label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET *
                  </Label>
                  <Input
                    id="siret"
                    {...register('siret')}
                    placeholder="12345678901234"
                    maxLength={14}
                    aria-required={showCompanyFields}
                    aria-invalid={!!errors.siret}
                  />
                  {errors.siret && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors.siret.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nomSociete" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la société *
                  </Label>
                  <Input
                    id="nomSociete"
                    {...register('nomSociete')}
                    placeholder="Nom de l'entreprise"
                    aria-required={showCompanyFields}
                    aria-invalid={!!errors.nomSociete}
                  />
                  {errors.nomSociete && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors.nomSociete.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="fonctionBeneficiaire" className="block text-sm font-medium text-gray-700 mb-1">
                    Fonction du bénéficiaire
                  </Label>
                  <Input
                    id="fonctionBeneficiaire"
                    {...register('fonctionBeneficiaire')}
                    placeholder="Développeur, Chef de projet, etc."
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Formation Section */}
        <section className={`bg-white p-6 rounded-lg border border-gray-200 ${isSubmitting ? 'opacity-75 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Formation
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="formation" className="block text-sm font-medium text-gray-700 mb-1">
                Formation *
              </Label>
              <Controller
                name="formationId"
                control={control}
                render={({ field }) => (
                  <FormationSearch
                    onSelect={handleFormationSelect}
                    onClear={handleFormationClear}
                    selectedFormation={field.value ? { id: field.value, nom: watch('formationNom') } : undefined}
                    placeholder="Rechercher une formation..."
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.formationId && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.formationId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dureeHeures" className="block text-sm font-medium text-gray-700 mb-1">
                  Durée en heures *
                </Label>
                <Input
                  id="dureeHeures"
                  type="number"
                  {...register('dureeHeures', { valueAsNumber: true })}
                  placeholder="35"
                  min="1"
                  max="9999"
                  aria-required="true"
                  aria-invalid={!!errors.dureeHeures}
                />
                {errors.dureeHeures && (
                  <p role="alert" className="mt-1 text-sm text-red-600">
                    {errors.dureeHeures.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="nombreParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de participants *
                </Label>
                <Input
                  id="nombreParticipants"
                  type="number"
                  {...register('nombreParticipants', { valueAsNumber: true })}
                  placeholder="4"
                  min="1"
                  max="999"
                  aria-required="true"
                  aria-invalid={!!errors.nombreParticipants}
                />
                {errors.nombreParticipants && (
                  <p role="alert" className="mt-1 text-sm text-red-600">
                    {errors.nombreParticipants.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tarifTTC" className="block text-sm font-medium text-gray-700 mb-1">
                  Tarif appliqué en € TTC *
                </Label>
                <Input
                  id="tarifTTC"
                  type="number"
                  {...register('tarifTTC', { valueAsNumber: true })}
                  placeholder="2500"
                  min="0"
                  max="999999"
                  step="0.01"
                  aria-required="true"
                  aria-invalid={!!errors.tarifTTC}
                />
                {errors.tarifTTC && (
                  <p role="alert" className="mt-1 text-sm text-red-600">
                    {errors.tarifTTC.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="derouleHoraire" className="block text-sm font-medium text-gray-700 mb-1">
                Déroulé Horaire *
              </Label>
              <Textarea
                id="derouleHoraire"
                {...register('derouleHoraire')}
                placeholder="Décrivez le planning et le contenu de la formation..."
                rows={4}
                aria-required="true"
                aria-invalid={!!errors.derouleHoraire}
              />
              {errors.derouleHoraire && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.derouleHoraire.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </Label>
                <Input
                  id="dateDebut"
                  type="date"
                  {...register('dateDebut')}
                  aria-required="true"
                  aria-invalid={!!errors.dateDebut}
                />
                {errors.dateDebut && (
                  <p role="alert" className="mt-1 text-sm text-red-600">
                    {errors.dateDebut.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin *
                </Label>
                <Input
                  id="dateFin"
                  type="date"
                  {...register('dateFin')}
                  aria-required="true"
                  aria-invalid={!!errors.dateFin}
                />
                {errors.dateFin && (
                  <p role="alert" className="mt-1 text-sm text-red-600">
                    {errors.dateFin.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Submit Section */}
        <section className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset(defaultProspectFormValues)}
              disabled={isSubmitting}
            >
              Réinitialiser
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="min-w-[120px] flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer'}</span>
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}