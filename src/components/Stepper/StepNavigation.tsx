import { useRef, useEffect } from 'react';
import { useStepper } from './StepperContext';
import type { StepNavigationProps } from './types';

export const StepNavigation = ({
  showLabels = true,
  className = '',
  renderStepIndicator,
}: StepNavigationProps) => {
  const { steps, currentStep, setCurrentStep } = useStepper();
  const navRef = useRef<HTMLElement>(null);
  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setCurrentStep(index);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        if (index < steps.length - 1) {
          setCurrentStep(index + 1);
          const nextButton = navRef.current?.querySelector(
            `#step-${index + 1}`,
          ) as HTMLButtonElement;
          nextButton?.focus();
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          setCurrentStep(index - 1);
          const prevButton = navRef.current?.querySelector(
            `#step-${index - 1}`,
          ) as HTMLButtonElement;
          prevButton?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        setCurrentStep(0);
        const firstButton = navRef.current?.querySelector(
          '#step-0',
        ) as HTMLButtonElement;
        firstButton?.focus();
        break;
      case 'End':
        e.preventDefault();
        setCurrentStep(steps.length - 1);
        const lastButton = navRef.current?.querySelector(
          `#step-${steps.length - 1}`,
        ) as HTMLButtonElement;
        lastButton?.focus();
        break;
    }
  };

  useEffect(() => {
    const buttons = navRef.current?.querySelectorAll('button[role="tab"]');
    buttons?.forEach((button, index) => {
      if (index === currentStep) {
        button.setAttribute('tabindex', '0');
      } else {
        button.setAttribute('tabindex', '-1');
      }
    });
  }, [currentStep]);

  return (
    <nav
      ref={navRef}
      className={`step-navigation ${className}`}
      aria-label="Progress"
      role="tablist"
    >
      <ol className="step-navigation__list">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';
          const isPending = step.status === 'pending';

          return (
            <li
              key={step.id}
              className={`step-navigation__item ${
                isActive ? 'step-navigation__item--active' : ''
              } ${isCompleted ? 'step-navigation__item--completed' : ''} ${
                isError ? 'step-navigation__item--error' : ''
              } ${isPending ? 'step-navigation__item--pending' : ''}`}
            >
              <button
                type="button"
                className="step-navigation__button"
                onClick={() => handleStepClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-current={isActive ? 'step' : undefined}
                aria-selected={isActive}
                aria-label={`Step ${index + 1}: ${step.label}${
                  isCompleted ? ' (completed)' : ''
                }${isError ? ' (error)' : ''}`}
                id={`step-${index}`}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-controls={`step-panel-${index}`}
              >
                {renderStepIndicator ? (
                  renderStepIndicator(step, index, isActive)
                ) : (
                  <>
                    <span className="step-navigation__indicator">
                      {isCompleted ? (
                        <svg
                          className="step-navigation__icon"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : isError ? (
                        <svg
                          className="step-navigation__icon"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="step-navigation__number">
                          {index + 1}
                        </span>
                      )}
                    </span>
                    {showLabels && (
                      <span className="step-navigation__label">
                        {step.label}
                      </span>
                    )}
                  </>
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`step-navigation__connector ${
                    isCompleted ? 'step-navigation__connector--completed' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      {steps[currentStep]?.errorMessage && (
        <div
          className="step-navigation__error"
          role="alert"
          aria-live="assertive"
        >
          {steps[currentStep].errorMessage}
        </div>
      )}
    </nav>
  );
};

StepNavigation.displayName = 'StepNavigation';
