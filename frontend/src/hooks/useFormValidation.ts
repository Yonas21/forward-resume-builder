import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((formData: { [key: string]: any }): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [rules, validateField]);

  const validateSingleField = useCallback((fieldName: string, value: any) => {
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
    return error;
  }, [validateField]);

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isFieldValid = useCallback((fieldName: string) => {
    return !errors[fieldName];
  }, [errors]);

  const isFormValid = useCallback((formData?: any) => {
    // If formData is provided, validate all fields without updating state
    if (formData) {
      // Check if all required fields have values and validate them
      for (const [fieldName, rule] of Object.entries(rules)) {
        const value = formData[fieldName];
        
        // Check if required field is empty
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          return false;
        }
        
        // If field has value, validate it
        if (value && (typeof value === 'string' && value.trim() !== '')) {
          const error = validateField(fieldName, value);
          if (error) {
            return false;
          }
        }
      }
      
      return true;
    }
    
    // Fallback: check existing errors
    return Object.keys(errors).length === 0;
  }, [errors, rules, validateField]);

  const getFieldError = useCallback((fieldName: string) => {
    return touched[fieldName] ? errors[fieldName] : null;
  }, [errors, touched]);

  return {
    errors,
    touched,
    validateForm,
    validateSingleField,
    setFieldTouched,
    clearFieldError,
    clearAllErrors,
    isFieldValid,
    isFormValid,
    getFieldError
  };
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+/,
  password: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL starting with http:// or https://',
  password: 'Password must contain at least one letter, one number, and be at least 8 characters long',
  required: (fieldName: string) => `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`,
  minLength: (fieldName: string, min: number) => `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${min} characters`,
  maxLength: (fieldName: string, max: number) => `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${max} characters`
};
