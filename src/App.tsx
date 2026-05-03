import { useState } from 'react';
import {
  Stepper,
  Step,
  StepNavigation,
} from './components/Stepper';
import type { StepRenderProps } from './components/Stepper';
import './App.css';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  newsletter: boolean;
  notifications: boolean;
  theme: 'light' | 'dark';
  hobbies: string;
  techLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  programmingLanguages: string;
  spokenLanguages: string;
}

/**
 * Validate phone numbers for a number of common country codes.
 *
 * Strategy:
 *  - Strip formatting (spaces, dashes, parentheses, dots).
 *  - Require an explicit country code prefixed with `+` OR a leading `00`
 *    (international dial-out), unless the number is a 10-digit US/CA
 *    national format.
 *  - Match the remaining digits against a length range that is valid
 *    for the detected country code (E.164 allows 4–15 digits total).
 */
const COUNTRY_CODE_RULES: Array<{ code: string; min: number; max: number }> = [
  { code: '1', min: 10, max: 10 },     // US / Canada
  { code: '7', min: 10, max: 10 },     // Russia / Kazakhstan
  { code: '20', min: 9, max: 10 },     // Egypt
  { code: '27', min: 9, max: 9 },      // South Africa
  { code: '30', min: 10, max: 10 },    // Greece
  { code: '31', min: 9, max: 9 },      // Netherlands
  { code: '32', min: 8, max: 9 },      // Belgium
  { code: '33', min: 9, max: 9 },      // France
  { code: '34', min: 9, max: 9 },      // Spain
  { code: '36', min: 8, max: 9 },      // Hungary
  { code: '39', min: 9, max: 11 },     // Italy
  { code: '40', min: 9, max: 9 },      // Romania
  { code: '41', min: 9, max: 9 },      // Switzerland
  { code: '43', min: 10, max: 13 },    // Austria
  { code: '44', min: 10, max: 10 },    // UK
  { code: '45', min: 8, max: 8 },      // Denmark
  { code: '46', min: 7, max: 13 },     // Sweden
  { code: '47', min: 8, max: 8 },      // Norway
  { code: '48', min: 9, max: 9 },      // Poland
  { code: '49', min: 6, max: 13 },     // Germany
  { code: '52', min: 10, max: 10 },    // Mexico
  { code: '54', min: 10, max: 11 },    // Argentina
  { code: '55', min: 10, max: 11 },    // Brazil
  { code: '57', min: 10, max: 10 },    // Colombia
  { code: '58', min: 10, max: 10 },    // Venezuela
  { code: '60', min: 9, max: 10 },     // Malaysia
  { code: '61', min: 9, max: 9 },      // Australia
  { code: '62', min: 9, max: 12 },     // Indonesia
  { code: '63', min: 10, max: 10 },    // Philippines
  { code: '64', min: 8, max: 10 },     // New Zealand
  { code: '65', min: 8, max: 8 },      // Singapore
  { code: '66', min: 9, max: 9 },      // Thailand
  { code: '81', min: 9, max: 10 },     // Japan
  { code: '82', min: 9, max: 10 },     // South Korea
  { code: '84', min: 9, max: 10 },     // Vietnam
  { code: '86', min: 11, max: 11 },    // China
  { code: '90', min: 10, max: 10 },    // Turkey
  { code: '91', min: 10, max: 10 },    // India
  { code: '92', min: 10, max: 10 },    // Pakistan
  { code: '93', min: 9, max: 9 },      // Afghanistan
  { code: '94', min: 9, max: 9 },      // Sri Lanka
  { code: '95', min: 8, max: 10 },     // Myanmar
  { code: '98', min: 10, max: 10 },    // Iran
  { code: '212', min: 9, max: 9 },     // Morocco
  { code: '234', min: 10, max: 10 },   // Nigeria
  { code: '254', min: 9, max: 9 },     // Kenya
  { code: '351', min: 9, max: 9 },     // Portugal
  { code: '352', min: 8, max: 9 },     // Luxembourg
  { code: '353', min: 9, max: 9 },     // Ireland
  { code: '354', min: 7, max: 9 },     // Iceland
  { code: '358', min: 9, max: 10 },    // Finland
  { code: '370', min: 8, max: 8 },     // Lithuania
  { code: '371', min: 8, max: 8 },     // Latvia
  { code: '372', min: 7, max: 8 },     // Estonia
  { code: '380', min: 9, max: 9 },     // Ukraine
  { code: '381', min: 8, max: 9 },     // Serbia
  { code: '420', min: 9, max: 9 },     // Czech Republic
  { code: '421', min: 9, max: 9 },     // Slovakia
  { code: '852', min: 8, max: 8 },     // Hong Kong
  { code: '886', min: 9, max: 9 },     // Taiwan
  { code: '966', min: 9, max: 9 },     // Saudi Arabia
  { code: '971', min: 8, max: 9 },     // UAE
  { code: '972', min: 8, max: 9 },     // Israel
  { code: '992', min: 9, max: 9 },     // Tajikistan
  { code: '993', min: 8, max: 8 },     // Turkmenistan
  { code: '994', min: 9, max: 9 },     // Azerbaijan
  { code: '995', min: 9, max: 9 },     // Georgia
  { code: '996', min: 9, max: 9 },     // Kyrgyzstan
  { code: '998', min: 9, max: 9 },     // Uzbekistan
];

const validatePhone = (raw: string): boolean => {
  // Phone is optional — empty input is valid.
  if (raw.trim() === '') return true;

  // Normalise: keep leading `+`, strip everything but digits.
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');

  // Convert international dial-out prefix `00` to `+`.
  if (!hasPlus && digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (!hasPlus) {
    // No country code provided. Allow only the US/CA 10-digit national
    // form; reject everything else (including sequences like "00000").
    if (digits.length === 10 && /^[2-9]/.test(digits)) {
      return true;
    }
    return false;
  }

  // E.164 hard limit: 1–15 digits after the country code prefix.
  if (digits.length < 4 || digits.length > 15) return false;

  // Match the longest country-code prefix first so e.g. "380..." is not
  // interpreted as country code "3".
  const sorted = [...COUNTRY_CODE_RULES].sort(
    (a, b) => b.code.length - a.code.length,
  );

  for (const { code, min, max } of sorted) {
    if (digits.startsWith(code)) {
      const national = digits.slice(code.length);
      if (national.length >= min && national.length <= max) {
        // Reject obviously bogus sequences (all zeros).
        if (/^0+$/.test(national)) return false;
        return true;
      }
      return false;
    }
  }

  return false;
};

function App() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
    country: '',
    newsletter: false,
    notifications: false,
    theme: 'dark',
    hobbies: '',
    techLevel: 'beginner',
    programmingLanguages: '',
    spokenLanguages: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const validatePersonalInfo = () => {
    const { firstName, lastName, email } = formData;
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      email.includes('@') &&
      email.includes('.')
    );
  };

  const validateAddress = () => {
    const { street, city, zipCode, country } = formData;
    return (
      street.trim() !== '' &&
      city.trim() !== '' &&
      zipCode.trim() !== '' &&
      country.trim() !== ''
    );
  };

  const handleFinish = () => {
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      zipCode: '',
      country: '',
      newsletter: false,
      notifications: false,
      theme: 'dark',
      hobbies: '',
      techLevel: 'beginner',
      programmingLanguages: '',
      spokenLanguages: '',
    });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="app">
        <div className="success-message">
          <h1>✓ Registration Complete!</h1>
          <p>Thank you for registering, {formData.firstName}!</p>
          <pre className="form-data">{JSON.stringify(formData, null, 2)}</pre>
          <button onClick={handleReset} className="reset-button">
            Register Another User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Multi-Step Registration Form</h1>
        <p>Compound Components Pattern with Render Props</p>
      </header>

      <main className="app-main">
        <Stepper
          initialStep={0}
          onStepChange={(from, to) => {
            console.log(`Step changed from ${from} to ${to}`);
          }}
          allowNonLinear={false}
        >
          <StepNavigation showLabels />

          {/* Step 1: Personal Information */}
          <Step
            id="personal-info"
            label="Personal Info"
            description="Please provide your personal information"
          >
            {({ setStepError, goToNext }: StepRenderProps) => (
              <div className="form-step">
                <h2>Personal Information</h2>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="firstName">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="John"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="lastName">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="john.doe@example.com"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="form-actions-custom">
                  <button
                    type="button"
                    onClick={() => {
                      if (!validatePersonalInfo()) {
                        setStepError('Please fill in all required fields correctly');
                        return;
                      }
                      if (!validatePhone(formData.phone)) {
                        setStepError(
                          'Please enter a valid phone number with country code (e.g. +1 555 123 4567, +44 20 7946 0958, +7 701 234 5678)',
                        );
                        return;
                      }
                      goToNext();
                    }}
                    className="button-primary"
                  >
                    Continue to Address
                  </button>
                </div>
              </div>
            )}
          </Step>

          {/* Step 2: Address */}
          <Step
            id="address"
            label="Address"
            description="Where should we send your information?"
          >
            {({ goToPrevious, setStepError, goToNext }: StepRenderProps) => (
              <div className="form-step">
                <h2>Address Information</h2>

                <div className="form-grid">
                  <div className="form-field form-field--full">
                    <label htmlFor="street">
                      Street Address <span className="required">*</span>
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={formData.street}
                      onChange={(e) => updateFormData('street', e.target.value)}
                      placeholder="123 Main Street"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="city">
                      City <span className="required">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="New York"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="zipCode">
                      ZIP Code <span className="required">*</span>
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => updateFormData('zipCode', e.target.value)}
                      placeholder="10001"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-field form-field--full">
                    <label htmlFor="country">
                      Country <span className="required">*</span>
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      placeholder="United States"
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="form-actions-custom">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="button-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateAddress()) {
                        goToNext();
                      } else {
                        setStepError('Please fill in all required fields');
                      }
                    }}
                    className="button-primary"
                  >
                    Continue to Preferences
                  </button>
                </div>
              </div>
            )}
          </Step>

          {/* Step 3: Preferences */}
          <Step
            id="preferences"
            label="Preferences"
            description="Customize your experience"
          >
            {({ goToPrevious, goToNext }: StepRenderProps) => (
              <div className="form-step">
                <h2>Preferences</h2>

                <div className="form-preferences">
                  <div className="form-checkbox">
                    <input
                      id="newsletter"
                      type="checkbox"
                      checked={formData.newsletter}
                      onChange={(e) => updateFormData('newsletter', e.target.checked)}
                    />
                    <label htmlFor="newsletter">
                      Subscribe to newsletter
                      <span className="checkbox-description">
                        Receive updates and news about our services
                      </span>
                    </label>
                  </div>

                  <div className="form-checkbox">
                    <input
                      id="notifications"
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) =>
                        updateFormData('notifications', e.target.checked)
                      }
                    />
                    <label htmlFor="notifications">
                      Enable notifications
                      <span className="checkbox-description">
                        Get notified about important updates
                      </span>
                    </label>
                  </div>

                  <div className="form-field">
                    <label htmlFor="theme">Theme Preference</label>
                    <select
                      id="theme"
                      value={formData.theme}
                      onChange={(e) =>
                        updateFormData('theme', e.target.value as 'light' | 'dark')
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions-custom">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="button-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="button-primary"
                  >
                    Continue to Skills
                  </button>
                </div>
              </div>
            )}
          </Step>

          {/* Step 4: Skills & Interests */}
          <Step
            id="skills"
            label="Skills"
            description="Tell us about your skills and interests"
          >
            {({ goToPrevious, goToNext }: StepRenderProps) => (
              <div className="form-step">
                <h2>Skills & Interests</h2>

                <div className="form-grid">
                  <div className="form-field form-field--full">
                    <label htmlFor="hobbies">Hobbies</label>
                    <input
                      id="hobbies"
                      type="text"
                      value={formData.hobbies}
                      onChange={(e) => updateFormData('hobbies', e.target.value)}
                      placeholder="e.g. Photography, Cooking, Hiking"
                    />
                  </div>

                  <div className="form-field form-field--full">
                    <label htmlFor="techLevel">Tech Experience Level</label>
                    <select
                      id="techLevel"
                      value={formData.techLevel}
                      onChange={(e) =>
                        updateFormData('techLevel', e.target.value as FormData['techLevel'])
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div className="form-field form-field--full">
                    <label htmlFor="programmingLanguages">Programming Languages</label>
                    <input
                      id="programmingLanguages"
                      type="text"
                      value={formData.programmingLanguages}
                      onChange={(e) => updateFormData('programmingLanguages', e.target.value)}
                      placeholder="e.g. TypeScript, Python, Rust"
                    />
                  </div>

                  <div className="form-field form-field--full">
                    <label htmlFor="spokenLanguages">Spoken Languages</label>
                    <input
                      id="spokenLanguages"
                      type="text"
                      value={formData.spokenLanguages}
                      onChange={(e) => updateFormData('spokenLanguages', e.target.value)}
                      placeholder="e.g. English, Russian, Spanish"
                    />
                  </div>
                </div>

                <div className="form-actions-custom">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="button-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="button-primary"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}
          </Step>

          {/* Step 6: Review & Confirm */}
          <Step id="review" label="Review" description="Please review your information">
            {({ goToPrevious, goToStep }: StepRenderProps) => (
              <div className="form-step">
                <h2>Review Your Information</h2>

                <div className="review-section">
                  <div className="review-header">
                    <h3>Personal Information</h3>
                    <button
                      type="button"
                      onClick={() => goToStep(0)}
                      className="edit-button"
                      aria-label="Edit personal information"
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="review-list">
                    <div>
                      <dt>Name:</dt>
                      <dd>{formData.firstName} {formData.lastName}</dd>
                    </div>
                    <div>
                      <dt>Email:</dt>
                      <dd>{formData.email}</dd>
                    </div>
                    {formData.phone && (
                      <div>
                        <dt>Phone:</dt>
                        <dd>{formData.phone}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="review-section">
                  <div className="review-header">
                    <h3>Address</h3>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="edit-button"
                      aria-label="Edit address"
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="review-list">
                    <div>
                      <dt>Street:</dt>
                      <dd>{formData.street}</dd>
                    </div>
                    <div>
                      <dt>City:</dt>
                      <dd>{formData.city}</dd>
                    </div>
                    <div>
                      <dt>ZIP Code:</dt>
                      <dd>{formData.zipCode}</dd>
                    </div>
                    <div>
                      <dt>Country:</dt>
                      <dd>{formData.country}</dd>
                    </div>
                  </dl>
                </div>

                <div className="review-section">
                  <div className="review-header">
                    <h3>Preferences</h3>
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="edit-button"
                      aria-label="Edit preferences"
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="review-list">
                    <div>
                      <dt>Newsletter:</dt>
                      <dd>{formData.newsletter ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt>Notifications:</dt>
                      <dd>{formData.notifications ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt>Theme:</dt>
                      <dd>{formData.theme}</dd>
                    </div>
                  </dl>
                </div>

                <div className="review-section">
                  <div className="review-header">
                    <h3>Skills & Interests</h3>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="edit-button"
                      aria-label="Edit skills"
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="review-list">
                    {formData.hobbies && (
                      <div>
                        <dt>Hobbies:</dt>
                        <dd>{formData.hobbies}</dd>
                      </div>
                    )}
                    <div>
                      <dt>Tech Level:</dt>
                      <dd>{formData.techLevel}</dd>
                    </div>
                    {formData.programmingLanguages && (
                      <div>
                        <dt>Programming:</dt>
                        <dd>{formData.programmingLanguages}</dd>
                      </div>
                    )}
                    {formData.spokenLanguages && (
                      <div>
                        <dt>Languages:</dt>
                        <dd>{formData.spokenLanguages}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="form-actions-custom">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="button-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="button-success"
                  >
                    Complete Registration
                  </button>
                </div>
              </div>
            )}
          </Step>

          {/* Alternative: Use StepActions component for automatic navigation */}
          {/* <StepActions
            onFinish={handleFinish}
            showCancel={true}
            onCancel={handleReset}
          /> */}
        </Stepper>
      </main>

      <footer className="app-footer">
        <p>
          Built with Compound Components Pattern & Render Props | Fully Accessible
          (A11y)
        </p>
        <p className="keyboard-hint">
          💡 Try keyboard navigation: Arrow keys, Home, End
        </p>
      </footer>
    </div>
  );
}

export default App;
