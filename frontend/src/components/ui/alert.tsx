import * as React from 'react';
import * as AlertPrimitive from '@radix-ui/react-alert';

import { cn } from '@/lib/utils';

const Alert = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof AlertPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <AlertPrimitive.Root
      ref={ref}
      className={cn(
        'relative w-full rounded-lg border border-border bg-background p-4 text-sm text-foreground [&>svg]:text-foreground',
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = AlertPrimitive.Root.displayName;

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof AlertPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <AlertPrimitive.Title ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  )
);
AlertTitle.displayName = AlertPrimitive.Title.displayName;

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof AlertPrimitive.Description>>(
  ({ className, ...props }, ref) => (
    <AlertPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
AlertDescription.displayName = AlertPrimitive.Description.displayName;

export { Alert, AlertTitle, AlertDescription };
