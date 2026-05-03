/**
 * Types for Stepper Component Library
 * Compound Components Pattern with Render Props
 */

import type { ReactNode } from 'react';

/**
 * Step status types
 */
export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

/**
 * Step data structure
 */
export interface StepData {
  id: string;
  label: string;
  status: StepStatus;
  isValid?: boolean;
  errorMessage?: string;
}

/**
 * Render prop function for Step content
 */
export interface StepRenderProps {
  /** Current step data */
  step: StepData;
  /** Navigate to next step */
  goToNext: () => void;
  /** Navigate to previous step */
  goToPrevious: () => void;
  /** Navigate to specific step by index */
  goToStep: (index: number) => void;
  /** Check if current step is first */
  isFirst: boolean;
  /** Check if current step is last */
  isLast: boolean;
  /** Mark step as completed and move to next */
  completeStep: () => void;
  /** Mark step as invalid with error message */
  setStepError: (message: string) => void;
  /** Total number of steps */
  totalSteps: number;
  /** Current step index (0-based) */
  currentIndex: number;
}

/**
 * Stepper context value
 * Used for internal state synchronization without prop drilling
 */
export interface StepperContextValue {
  /** All steps data */
  steps: StepData[];
  /** Current active step index */
  currentStep: number;
  /** Set current step */
  setCurrentStep: (index: number) => void;
  /** Update specific step data */
  updateStep: (index: number, data: Partial<StepData>) => void;
  /** Register a new step */
  registerStep: (step: StepData) => void;
  /** Validation mode */
  validationMode?: 'onChange' | 'onSubmit';
  /** Callback when step changes */
  onStepChange?: (fromIndex: number, toIndex: number) => void;
}

/**
 * Props for Stepper root component
 */
export interface StepperProps {
  /** Child components (Step, StepNavigation, etc.) */
  children: ReactNode;
  /** Initial step index (0-based) */
  initialStep?: number;
  /** Callback when step changes */
  onStepChange?: (fromIndex: number, toIndex: number) => void;
  /** Allow non-linear navigation */
  allowNonLinear?: boolean;
  /** Validation mode */
  validationMode?: 'onChange' | 'onSubmit';
  /** Custom className */
  className?: string;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Props for Step component
 */
export interface StepProps {
  /** Unique step identifier */
  id: string;
  /** Step label */
  label: string;
  /** Render prop function OR children */
  children?: ((props: StepRenderProps) => ReactNode) | ReactNode;
  /** Optional render prop (alternative to children) */
  render?: (props: StepRenderProps) => ReactNode;
  /** Validation function */
  validate?: () => boolean | Promise<boolean>;
  /** Optional description */
  description?: string;
}

/**
 * Props for StepNavigation component
 */
export interface StepNavigationProps {
  /** Show step labels */
  showLabels?: boolean;
  /** Custom className */
  className?: string;
  /** Render custom step indicator */
  renderStepIndicator?: (step: StepData, index: number, isActive: boolean) => ReactNode;
}

/**
 * Props for StepContent component
 */
export interface StepContentProps {
  /** Custom className */
  className?: string;
  /** Animation duration in ms */
  animationDuration?: number;
}

/**
 * Props for StepActions component
 */
export interface StepActionsProps {
  /** Custom className */
  className?: string;
  /** Custom next button label */
  nextLabel?: string;
  /** Custom previous button label */
  previousLabel?: string;
  /** Custom finish button label */
  finishLabel?: string;
  /** Show cancel button */
  showCancel?: boolean;
  /** Cancel button label */
  cancelLabel?: string;
  /** On cancel callback */
  onCancel?: () => void;
  /** On finish callback */
  onFinish?: () => void;
  /** Render custom actions */
  render?: (props: StepRenderProps & {
    handleNext: () => void;
    handlePrevious: () => void;
    handleFinish: () => void;
  }) => ReactNode;
}
