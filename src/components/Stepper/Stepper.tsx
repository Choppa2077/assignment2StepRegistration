
import { useState, useCallback, useRef, useEffect } from 'react';
import { StepperContext } from './StepperContext';
import type { StepperProps, StepData, StepperContextValue } from './types';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './Stepper.css';

export const Stepper = ({
  children,
  initialStep = 0,
  onStepChange,
  allowNonLinear = false,
  validationMode = 'onChange',
  className = '',
  orientation = 'horizontal',
}: StepperProps) => {
  const [steps, setSteps] = useState<StepData[]>([]);
  const [currentStep, setCurrentStepState] = useState(initialStep);
  const stepsRegistered = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setCurrentStep = useCallback(
    (index: number) => {
      let didNavigate = false;
      const previousStep = currentStep;

      // Use functional updater so we read the freshest steps state.
      // This avoids the issue where updateStep(currentStep, 'completed')
      // was queued just before setCurrentStep, but the closure still saw
      // the old 'active' status, causing the first click to be ignored.
      setSteps((prevSteps) => {
        if (index < 0 || index >= prevSteps.length) {
          return prevSteps;
        }

        // Always allow the natural one-step-forward progression.
        // Only enforce the "all previous completed" check when skipping
        // ahead by more than one step in linear mode.
        if (!allowNonLinear && index > previousStep + 1) {
          const allPreviousCompleted = prevSteps
            .slice(0, index)
            .every((step) => step.status === 'completed');

          if (!allPreviousCompleted) {
            console.warn('Cannot skip to step. Complete previous steps first.');
            return prevSteps;
          }
        }

        didNavigate = true;
        return prevSteps.map((step, i) => ({
          ...step,
          status:
            i === index ? 'active' : i < index ? 'completed' : 'pending',
        }));
      });

      if (didNavigate) {
        setCurrentStepState(index);
        onStepChange?.(previousStep, index);
      }
    },
    [currentStep, allowNonLinear, onStepChange]
  );

  const updateStep = useCallback((index: number, data: Partial<StepData>) => {
    setSteps((prevSteps) =>
      prevSteps.map((step, i) =>
        i === index ? { ...step, ...data } : step
      )
    );
  }, []);

  
  const registerStep = useCallback((step: StepData) => {
    setSteps((prevSteps) => {
      if (prevSteps.some((s) => s.id === step.id)) {
        return prevSteps;
      }
      return [...prevSteps, step];
    });
  }, []);


  useEffect(() => {
    if (steps.length > 0 && !stepsRegistered.current) {
      stepsRegistered.current = true;
      setSteps((prevSteps) =>
        prevSteps.map((step, i) => ({
          ...step,
          status: i === initialStep ? 'active' : 'pending',
        }))
      );
    }
  }, [steps.length, initialStep]);

  useFocusTrap(containerRef, true);

  const contextValue: StepperContextValue = {
    steps,
    currentStep,
    setCurrentStep,
    updateStep,
    registerStep,
    validationMode,
    onStepChange,
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`stepper stepper--${orientation} ${className}`}
        role="group"
        aria-label="Multi-step form"
        data-orientation={orientation}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
};

Stepper.displayName = 'Stepper';
