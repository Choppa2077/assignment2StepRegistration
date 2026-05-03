---
pr: 6
date: 2026-05-03
title: fix(qa): batch fix from QA thread 2026-05-03
features: Registration, Stepper, StepNavigation, Validation, Layout Shift
---

## Summary
Fixed a layout shift bug where validation error messages in the step navigation component would push form content down when appearing. The solution uses a fixed-height container (`.step-navigation__error-slot`) that reserves vertical space at all times, with the error message conditionally rendered inside it only when validation fails.

## Changed files
- `src/components/Stepper/StepNavigation.tsx` — Refactored error rendering from conditional wrapper to always-present container with conditional content inside. Extracted `errorMessage` to a variable for clarity. Changed from `role="alert"` on error div to `aria-live="assertive"` on parent slot for better accessibility.
- `src/components/Stepper/Stepper.css` — Added `.step-navigation__error-slot` class with `min-height: 3rem` and `margin-top: 1rem` to reserve fixed vertical space. Moved margin styling from `.step-navigation__error` to the slot to prevent layout shifts.

## Key implementation details
- **Layout shift prevention**: Changed from conditional rendering `{condition && <div>}` to always-rendering container with conditional content inside: `<div>{condition && <div>}</div></div>`
- **Fixed height reservation**: `.step-navigation__error-slot` has `min-height: 3rem` to accommodate error message without layout reflow
- **Accessibility change**: Moved `aria-live="assertive"` from error div to parent slot (`error-slot`); kept `role="alert"` on inner error div when it renders
- **CSS margin**: `margin-top: 1rem` now applied to `.step-navigation__error-slot` instead of `.step-navigation__error` to maintain consistent spacing regardless of error visibility
- **No breaking changes**: This is a pure visual/layout fix; API and component props unchanged

## Likely affected screens
- Registration form with multi-step stepper — error validation feedback now maintains layout integrity
- Any screen using `StepNavigation` component — vertical spacing behavior changed
- Forms with validation error messages below step indicators — spacing and animation behavior may differ if CSS transitions were applied