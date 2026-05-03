---
pr: 7
date: 2026-05-03
title: fix(qa): batch fix from QA thread 2026-05-03
features: Registration, Phone Validation, Form Input, E.164, Country Codes
---

## Summary
Added comprehensive phone number validation to the Registration form's Personal Info step. The fix implements a `validatePhone()` helper that enforces E.164-style formatting with country-code validation across 70+ country codes, rejecting invalid sequences like "00000" that previously passed through. Phone validation is now integrated into the step's submit handler before proceeding.

## Changed files
- `src/App.tsx` — Added `COUNTRY_CODE_RULES` constant with 70+ country-code-specific digit length rules; implemented `validatePhone()` helper function with E.164 validation logic; wired phone validation into the Personal Info step submit handler; added `inputMode="tel"` and `autoComplete="tel"` attributes to phone input field; refactored submit button logic to validate phone number after basic form validation and provide specific error messaging.

## Key implementation details
- **Country code detection:** Matches longest country-code prefix first (e.g., "380" before "3") to avoid false matches on multi-digit codes. Uses a sorted array by code length descending.
- **Phone validation strategy:**
  - Empty/whitespace-only input is considered valid (phone is optional)
  - Strips non-digit characters, preserves leading `+` for country code detection
  - Converts international dial-out prefix `00` to implicit country code
  - Allows US/CA 10-digit national format (starting with 2-9) only when no country code provided
  - Enforces E.164 hard limit: 4–15 total digits after country code
  - Rejects "obviously bogus" sequences (all zeros in national number)
- **Submit handler refactoring:** Changed from nested if/else to early-return pattern; added separate validation checks for basic form validity, then phone format, with specific error messages; phone validation runs *after* basic field validation succeeds.
- **HTML5 attributes:** Added `inputMode="tel"` and `autoComplete="tel"` to improve mobile UX and enable browser auto-completion.
- **Non-obvious decision:** Phone field is optional (empty string passes validation), but if provided, must strictly conform to country-code rules. Sequences like "00000" are explicitly rejected as a safety measure.

## Likely affected screens
- Registration → Personal Info step — Phone input field now has stricter validation; users entering numbers without country codes or with invalid formats will see error message and be blocked from advancing.
- Any form submission logic relying on the Personal Info step's `goToNext()` behavior — validation now happens in two stages (form fields, then phone format) rather than one.