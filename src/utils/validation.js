// Shared react-hook-form rules. Client-side checks only — they improve the
// form experience but are not a substitute for server-side validation.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Accepts 080..., 081..., 070..., 090..., 091... and +234 variants.
export const NG_PHONE_PATTERN = /^(\+234|234|0)[789][01]\d{8}$/;

export const normalisePhone = (value = '') => value.replace(/[\s-()]/g, '');

export const rules = {
  required: (label) => ({ required: `${label} is required` }),
  email: (optional = false) => ({
    ...(optional ? {} : { required: 'Email address is required' }),
    pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
  }),
  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Use at least 8 characters' },
  },
  phone: {
    required: 'Phone number is required',
    validate: (v) => NG_PHONE_PATTERN.test(normalisePhone(v)) || 'Enter a valid Nigerian phone number, e.g. 0803 123 4567',
  },
  minText: (label, min) => ({
    required: `${label} is required`,
    minLength: { value: min, message: `Please write at least ${min} characters` },
  }),
};

export function passwordStrength(pw = '') {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  return { score, label: labels[score] };
}
