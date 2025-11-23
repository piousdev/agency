'use client';

import * as React from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { Input } from './input';
import { Button } from './button';
import {
  validatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordStrengthBgColor,
} from '@/lib/utils/validate-password';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
  onPasswordChange?: (password: string, isValid: boolean) => void;
}

/**
 * Password Input Component with Strength Indicator
 *
 * Features:
 * - Toggle password visibility (show/hide)
 * - Real-time password strength validation
 * - Visual strength indicator (progress bar)
 * - Detailed error messages
 * - Accessible (ARIA labels, keyboard navigation)
 *
 * Usage:
 * ```tsx
 * <PasswordInput
 *   showStrengthIndicator={true}
 *   onPasswordChange={(password, isValid) => {
 *     // Handle password change
 *   }}
 * />
 * ```
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthIndicator = false, onPasswordChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [strength, setStrength] = React.useState<ReturnType<
      typeof validatePasswordStrength
    > | null>(null);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setPassword(newPassword);

      if (showStrengthIndicator && newPassword) {
        const validation = validatePasswordStrength(newPassword);
        setStrength(validation);
        onPasswordChange?.(newPassword, validation.isValid);
      } else {
        setStrength(null);
        onPasswordChange?.(newPassword, true);
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10', className)}
            value={password}
            onChange={handlePasswordChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <IconEyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <IconEye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>

        {/* Strength Indicator */}
        {showStrengthIndicator && password && strength && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    index < strength.score
                      ? getPasswordStrengthBgColor(strength.score)
                      : 'bg-gray-200'
                  )}
                />
              ))}
            </div>

            {/* Strength Label */}
            <p className={cn('text-sm font-medium', getPasswordStrengthColor(strength.score))}>
              {getPasswordStrengthLabel(strength.score)}
            </p>

            {/* Error Messages */}
            {strength.errors.length > 0 && (
              <ul className="space-y-1 text-sm text-red-600">
                {strength.errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Suggestions (only show when password is valid) */}
            {strength.isValid && strength.suggestions.length > 0 && (
              <ul className="space-y-1 text-sm text-gray-600">
                {strength.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">💡</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
