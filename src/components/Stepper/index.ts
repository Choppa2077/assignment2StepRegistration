/**
 * Stepper Component Library
 * Compound Components Pattern with Render Props
 *
 * Example usage:
 *
 * <Stepper>
 *   <StepNavigation />
 *
 *   <Step id="step1" label="Personal Info">
 *     {({ goToNext, setStepError }) => (
 *       <div>
 *         <input />
 *         <button onClick={goToNext}>Next</button>
 *       </div>
 *     )}
 *   </Step>
 *
 *   <Step id="step2" label="Review">
 *     {({ goToPrevious, isLast }) => (
 *       <div>Review content</div>
 *     )}
 *   </Step>
 *
 *   <StepActions />
 * </Stepper>
 */

export { Stepper } from './Stepper';
export { Step } from './Step';
export { StepNavigation } from './StepNavigation';
export { StepActions } from './StepActions';
export { useStepper, useOptionalStepper } from './StepperContext';

export type {
  StepperProps,
  StepProps,
  StepNavigationProps,
  StepActionsProps,
  StepRenderProps,
  StepData,
  StepStatus,
} from './types';
