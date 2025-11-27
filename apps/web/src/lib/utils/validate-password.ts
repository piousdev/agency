/**
 * Password Validation Utilities
 *
 * Provides client-side password strength validation with detailed feedback.
 * Complements server-side validation (min 8, max 128 characters).
 *
 * Requirements:
 * - Minimum 8 characters (NIST recommendation)
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-5 (0 = very weak, 5 = very strong)
  errors: string[];
  suggestions: string[];
}

/**
 * Validates password strength and provides detailed feedback
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score++;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score++;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+=[\]{}|;:,.<>?-]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score++;
  }

  // Additional strength checks for suggestions
  if (password.length >= 12) {
    suggestions.push('Strong: Password is 12+ characters');
  } else if (password.length >= 10) {
    suggestions.push('Good: Consider using 12+ characters for maximum security');
  }

  // Check for common patterns (optional suggestions)
  if (/^[a-z]+$/.test(password)) {
    suggestions.push('Weak: Avoid using only lowercase letters');
  }
  if (/^[A-Z]+$/.test(password)) {
    suggestions.push('Weak: Avoid using only uppercase letters');
  }
  if (/^[0-9]+$/.test(password)) {
    suggestions.push('Weak: Avoid using only numbers');
  }
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Weak: Avoid repeating characters (e.g., "aaa", "111")');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    score,
    errors,
    suggestions,
  };
}

/**
 * Gets a human-readable strength label based on score
 */
export function getPasswordStrengthLabel(score: number): string {
  if (score === 0) return 'Very Weak';
  if (score === 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  if (score === 4) return 'Strong';
  return 'Very Strong';
}

/**
 * Gets a color class for the strength indicator
 */
export function getPasswordStrengthColor(score: number): string {
  if (score === 0) return 'text-red-600';
  if (score === 1) return 'text-orange-600';
  if (score === 2) return 'text-yellow-600';
  if (score === 3) return 'text-blue-600';
  if (score === 4) return 'text-green-600';
  return 'text-green-700';
}

/**
 * Gets a background color class for the strength progress bar
 */
export function getPasswordStrengthBgColor(score: number): string {
  if (score === 0) return 'bg-red-600';
  if (score === 1) return 'bg-orange-600';
  if (score === 2) return 'bg-yellow-600';
  if (score === 3) return 'bg-blue-600';
  if (score === 4) return 'bg-green-600';
  return 'bg-green-700';
}
