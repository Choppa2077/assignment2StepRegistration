import { createContext, useContext } from 'react';
import type { StepperContextValue } from './types';

export const StepperContext = createContext<StepperContextValue | null>(null);

export const useStepper = (): StepperContextValue => {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error(
      'useStepper must be used within a Stepper component. ' +
        'Wrap your component with <Stepper>...</Stepper>',
    );
  }

  return context;
};

export const useOptionalStepper = (): StepperContextValue | null => {
  return useContext(StepperContext);
};
