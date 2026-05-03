/**
 * StepActions Component
 * Navigation buttons for steps with customization via render props
 */

import { useStepper } from './StepperContext';
import type { StepActionsProps } from './types';

export const StepActions = ({
  className = '',
  nextLabel = 'Next',
  previousLabel = 'Previous',
  finishLabel = 'Finish',
  showCancel = false,
  cancelLabel = 'Cancel',
  onCancel,
  onFinish,
  render,
}: StepActionsProps) => {
  const { steps, currentStep, setCurrentStep, updateStep } = useStepper();

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  /**
   * Handle next button
   */
  const handleNext = () => {
    if (!isLast) {
      // Mark current step as completed
      updateStep(currentStep, { status: 'completed' });
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Handle previous button
   */
  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle finish button
   */
  const handleFinish = () => {
    updateStep(currentStep, { status: 'completed' });
    onFinish?.();
  };

  /**
   * If custom render function provided, use it
   */
  if (render) {
    return (
      <div className={`step-actions ${className}`}>
        {render({
          step: currentStepData,
          goToNext: handleNext,
          goToPrevious: handlePrevious,
          goToStep: setCurrentStep,
          isFirst,
          isLast,
          completeStep: handleNext,
          setStepError: (message: string) =>
            updateStep(currentStep, { status: 'error', errorMessage: message }),
          totalSteps: steps.length,
          currentIndex: currentStep,
          handleNext,
          handlePrevious,
          handleFinish,
        })}
      </div>
    );
  }

  /**
   * Default actions UI
   */
  return (
    <div className={`step-actions ${className}`}>
      <div className="step-actions__buttons">
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="step-actions__button step-actions__button--cancel"
          >
            {cancelLabel}
          </button>
        )}

        <div className="step-actions__navigation">
          {!isFirst && (
            <button
              type="button"
              onClick={handlePrevious}
              className="step-actions__button step-actions__button--previous"
              aria-label="Go to previous step"
            >
              {previousLabel}
            </button>
          )}

          {!isLast ? (
            <button
              type="button"
              onClick={handleNext}
              className="step-actions__button step-actions__button--next"
              aria-label="Go to next step"
            >
              {nextLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="step-actions__button step-actions__button--finish"
              aria-label="Complete form"
            >
              {finishLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

StepActions.displayName = 'StepActions';
