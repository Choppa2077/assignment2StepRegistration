import { useEffect, useMemo, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useStepper } from './StepperContext';
import type { StepProps, StepRenderProps, StepData } from './types';

export const Step = ({
  id,
  label,
  children,
  render,
  validate,
  description,
}: StepProps) => {
  const { steps, currentStep, setCurrentStep, updateStep, registerStep } =
    useStepper();

  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!hasRegistered.current) {
      const stepData: StepData = {
        id,
        label,
        status: 'pending',
        isValid: true,
      };
      registerStep(stepData);
      hasRegistered.current = true;
    }
  }, []);

  /**
   * Find current step index
   */
  const stepIndex = useMemo(
    () => steps.findIndex((step) => step.id === id),
    [steps, id],
  );

  const isActive = stepIndex === currentStep;
  const stepData = useMemo(
    () => steps[stepIndex] || { id, label, status: 'pending' as const },
    [steps, stepIndex, id, label],
  );

  const goToNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      updateStep(stepIndex, { status: 'completed', isValid: true });
      setCurrentStep(stepIndex + 1);
    }
  }, [stepIndex, steps.length, setCurrentStep, updateStep]);

  const goToPrevious = useCallback(() => {
    if (stepIndex > 0) {
      setCurrentStep(stepIndex - 1);
    }
  }, [stepIndex, setCurrentStep]);

  const goToStep = useCallback(
    (index: number) => {
      setCurrentStep(index);
    },
    [setCurrentStep],
  );
  const completeStep = useCallback(async () => {
    // Run validation if provided
    if (validate) {
      const isValid = await validate();
      if (!isValid) {
        updateStep(stepIndex, { status: 'error', isValid: false });
        return;
      }
    }

    updateStep(stepIndex, { status: 'completed', isValid: true });
    goToNext();
  }, [validate, updateStep, stepIndex, goToNext]);
  const setStepError = useCallback(
    (message: string) => {
      updateStep(stepIndex, {
        status: 'error',
        isValid: false,
        errorMessage: message,
      });
    },
    [updateStep, stepIndex],
  );
  const renderProps: StepRenderProps = {
    step: stepData,
    goToNext,
    goToPrevious,
    goToStep,
    isFirst: stepIndex === 0,
    isLast: stepIndex === steps.length - 1,
    completeStep,
    setStepError,
    totalSteps: steps.length,
    currentIndex: stepIndex,
  };

  // Don't render if not active
  if (!isActive) {
    return null;
  }

  let content: ReactNode;

  if (render) {
    content = render(renderProps);
  } else if (typeof children === 'function') {
    content = children(renderProps);
  } else {
    content = children;
  }

  return (
    <div
      className="step-content"
      role="tabpanel"
      aria-labelledby={`step-${stepIndex}`}
      id={`step-panel-${stepIndex}`}
    >
      {description && (
        <p className="step-description" aria-live="polite">
          {description}
        </p>
      )}
      {content}
    </div>
  );
};

Step.displayName = 'Step';
