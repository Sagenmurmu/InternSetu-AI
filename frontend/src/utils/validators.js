// ============================================================
// InternSetu AI — Validators
// ============================================================

export function validateEmail(email) {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Invalid email address';
  return null;
}

export function validateRequired(value, fieldName = 'Field') {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateCapacity(capacity) {
  if (!capacity && capacity !== 0) return 'Capacity is required';
  const num = Number(capacity);
  if (isNaN(num)) return 'Capacity must be a number';
  if (num < 1) return 'Capacity must be at least 1';
  if (num > 1000) return 'Capacity cannot exceed 1000';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateStipend(stipend) {
  if (!stipend && stipend !== 0) return 'Stipend is required';
  const num = Number(stipend);
  if (isNaN(num)) return 'Stipend must be a number';
  if (num < 0) return 'Stipend cannot be negative';
  return null;
}
