import React, { useState, useEffect } from 'react';
import styles from './LoginForm.module.css';

const EnhancedLoginForm = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Security & Rate Limiting (Brute Force Protection Simulation)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [serverError, setServerError] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Countdown timer for Rate Limiting / Brute Force Lockout
  useEffect(() => {
    let timer;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTime === 0 && failedAttempts >= 3) {
      // Reset attempts after lockout period ends
      setFailedAttempts(0);
      setServerError('');
    }
    return () => clearInterval(timer);
  }, [lockoutTime, failedAttempts]);

  const validateField = (name, value) => {
    switch (name) {
      case 'identifier': {
        if (!value.trim()) {
          return 'Email or Username is required';
        }
        // Check if input looks like an email vs username
        const isEmail = value.includes('@');
        if (isEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
          }
        } else {
          if (value.length < 3) {
            return 'Username must be at least 3 characters';
          }
        }
        return '';
      }

      case 'password': {
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        if (!hasUpper || !hasLower || !hasNumber) {
          return 'Password must contain uppercase, lowercase, and numbers';
        }
        return '';
      }

      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue
    }));

    if (serverError) setServerError('');

    // Real-time validation if field has been touched
    if (touched[name]) {
      const fieldError = validateField(name, fieldValue);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name, fieldValue);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    ['identifier', 'password'].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (lockoutTime > 0) return;

    // Mark all as touched
    setTouched({
      identifier: true,
      password: true
    });

    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    // Simulate API call authentication delay
    setTimeout(() => {
      setIsLoading(false);

      // Simulation rule: Correct login demo credential: user@example.com / Password123
      const isCorrectDemo =
        (formData.identifier.toLowerCase() === 'user@example.com' ||
          formData.identifier.toLowerCase() === 'admin') &&
        formData.password === 'Password123';

      // Alternatively accept any fully valid credentials for demo, unless deliberately testing brute force failure
      if (isCorrectDemo || (formData.identifier && formData.password.length >= 8 && failedAttempts < 2)) {
        setIsSubmitted(true);
        setFailedAttempts(0);
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 3) {
          setLockoutTime(30); // Lockout for 30 seconds
          setServerError('⚠️ Account locked due to 3 consecutive failed attempts. Try again in 30 seconds.');
        } else {
          setServerError(`❌ Invalid credentials. Attempt ${nextAttempts} of 3 before temporary lockout.`);
        }
      }
    }, 1200);
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { strength: score, label: labels[score] || 'Very Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotEmail.trim() && forgotEmail.includes('@')) {
      setForgotSent(true);
      setTimeout(() => {
        setForgotSent(false);
        setShowForgotModal(false);
        setForgotEmail('');
      }, 2500);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.alertSuccess}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>🎉 Login Successful!</h2>
          <p style={{ margin: '0 0 1rem 0' }}>
            Welcome back, <strong>{formData.identifier}</strong>!
          </p>
          <button
            className={styles.submitButton}
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ identifier: '', password: '', rememberMe: false });
              setTouched({});
            }}
          >
            Log Out / Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome Back</h1>
      <p className={styles.subtitle}>Please enter your details to sign in</p>

      {/* Social Login Buttons */}
      <div className={styles.socialButtons}>
        <button type="button" className={styles.socialButton} onClick={() => alert('Google Social Login')}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google
        </button>
        <button type="button" className={styles.socialButton} onClick={() => alert('GitHub Social Login')}>
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </button>
      </div>

      <div className={styles.divider}>
        <span>OR CONTINUE WITH</span>
      </div>

      {/* Brute Force / Rate Limit Warning Banner */}
      {lockoutTime > 0 && (
        <div className={styles.alertWarning}>
          🛑 <strong>Account Temporarily Locked!</strong>
          <br />
          Too many failed attempts. Please wait <strong>{lockoutTime} seconds</strong> before trying again.
        </div>
      )}

      {/* Server Error Alert Banner */}
      {serverError && lockoutTime === 0 && (
        <div className={styles.alertError}>
          {serverError}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Email or Username Input */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="identifier">
            Email or Username *
          </label>
          <input
            id="identifier"
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={isLoading || lockoutTime > 0}
            className={`${styles.input} ${errors.identifier && touched.identifier ? styles.inputError : ''}`}
            placeholder="name@example.com or username"
          />
          {errors.identifier && touched.identifier && (
            <span className={styles.errorMessage}>{errors.identifier}</span>
          )}
        </div>

        {/* Password Input */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Password *
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={isLoading || lockoutTime > 0}
              className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '0.85rem'
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor:
                        i <= passwordStrength.strength
                          ? ['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'][i - 1]
                          : '#e2e8f0',
                      borderRadius: '2px',
                      transition: 'background-color 0.3s'
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color:
                    passwordStrength.strength >= 4
                      ? '#15803d'
                      : passwordStrength.strength >= 3
                        ? '#ca8a04'
                        : '#dc2626'
                }}
              >
                Password Strength: {passwordStrength.label}
              </span>
            </div>
          )}

          {errors.password && touched.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>

        {/* Options Row: Remember Me & Forgot Password */}
        <div className={styles.optionsRow}>
          <label className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className={styles.checkbox}
              disabled={isLoading || lockoutTime > 0}
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className={styles.forgotLink}
            onClick={() => setShowForgotModal(true)}
            disabled={isLoading || lockoutTime > 0}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || lockoutTime > 0}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner} />
              <span>Authenticating...</span>
            </>
          ) : lockoutTime > 0 ? (
            `Locked (${lockoutTime}s)`
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Reset Password</h3>
            <p className={styles.modalSubtitle}>
              Enter your registered email address and we'll send you instructions to reset your password.
            </p>

            {forgotSent ? (
              <div className={styles.alertSuccess} style={{ margin: 0, padding: '0.75rem' }}>
                ✓ Password reset link sent to your email!
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={styles.input}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton} style={{ margin: 0, width: 'auto' }}>
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLoginForm;
