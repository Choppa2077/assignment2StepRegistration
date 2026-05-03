# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite)
npm run build     # Type-check + build for production (tsc -b && vite build)
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

No test runner is configured.

## Architecture

This project implements a **Stepper component library** using the Compound Components + Render Props patterns. All library code lives in `src/components/Stepper/`; `src/App.tsx` is just a demo consumer.

### State flow

`Stepper` (root) owns all state (`steps[]`, `currentStep`) and exposes it through `StepperContext`. Child components — `Step`, `StepNavigation`, `StepActions` — read/write state exclusively via `useStepper()`. No props are drilled.

### Step registration

Each `Step` self-registers by calling `registerStep()` from context on mount (guarded by a `useRef` flag so it only runs once). After all steps register, a `useEffect` in `Stepper` initialises their statuses (`active` for `initialStep`, `pending` for the rest).

### Navigation invariant (linear mode)

`setCurrentStep` in `Stepper.tsx` uses a functional `setSteps` updater to read the latest step state at the moment of execution. This is intentional: it resolves a race condition where `updateStep(currentStep, 'completed')` and `setCurrentStep(next)` were batched together and the old status was read. One-step-forward progression is always allowed; skipping ahead requires all prior steps to be `completed`.

### Render props contract

`Step` passes a `StepRenderProps` object to its `children` function (or `render` prop). The consumer is responsible for calling `goToNext()` / `setStepError()` at the appropriate time. `completeStep()` runs the optional `validate` prop before advancing.

### `StepActions` vs custom navigation

`StepActions` is a convenience component with default Previous/Next/Finish buttons. In `App.tsx` it is intentionally replaced with custom per-step buttons (using `goToNext`/`goToPrevious` from render props) to demonstrate the pattern. The commented-out `<StepActions />` block at the bottom of `App.tsx` shows the simpler alternative.

### Accessibility

`useFocusTrap` (`src/hooks/useFocusTrap.ts`) is applied to the entire `Stepper` container. `StepNavigation` implements the ARIA `tablist/tab/tabpanel` pattern with arrow-key, Home, and End keyboard navigation. Error messages render in an `aria-live="assertive"` region.

### CSS theming

Component styles are in `src/components/Stepper/Stepper.css` and use CSS custom properties (`--stepper-primary`, `--stepper-success`, etc.) for theming. Dark mode is handled via `prefers-color-scheme`. Demo-level styles are in `src/App.css`.
