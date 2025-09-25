import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext
} from 'react-hook-form';

import { cn } from '@/lib/utils';

const Form = FormProvider;

const FormFieldContext = React.createContext<{
  name: string;
}>({
  name: ''
});

const FormItemContext = React.createContext<{ id: string } | undefined>(undefined);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  return {
    id: itemContext?.id ?? fieldContext.name,
    name: fieldContext.name,
    formItemId: itemContext?.id,
    ...fieldState
  };
};

const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  render
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name }}>
    <Controller control={control} name={name} render={render} />
  </FormFieldContext.Provider>
);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('grid gap-1.5', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { formItemId, error } = useFormField();
  return (
    <label
      ref={ref}
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      htmlFor={formItemId}
      {...props}
      data-invalid={error ? '' : undefined}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ className, ...props }, ref) => {
    const { formItemId, error } = useFormField();
    return <Slot ref={ref} id={formItemId} aria-invalid={!!error} className={className} {...props} />;
  }
);
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formItemId } = useFormField();
    return <p ref={ref} className={cn('text-sm text-muted-foreground', className)} id={`${formItemId}-description`} {...props} />;
  }
);
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formItemId } = useFormField();
    const body = error?.message ?? children;
    if (!body) {
      return null;
    }

    return (
      <p ref={ref} className={cn('text-sm font-medium text-destructive', className)} id={`${formItemId}-message`} {...props}>
        {body}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage };
