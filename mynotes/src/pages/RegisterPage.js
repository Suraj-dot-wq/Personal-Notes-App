import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        setError('');

        const cleanUsername = username.trim();
        const cleanEmail = email.trim();

        /* ================================
           BASIC VALIDATION
           ================================ */

        if (!cleanUsername) {
            const message = 'Username is required.';
            setError(message);
            showToast(message, 'error');
            return;
        }

        if (!cleanEmail) {
            const message = 'Email is required.';
            setError(message);
            showToast(message, 'error');
            return;
        }

        if (!password) {
            const message = 'Password is required.';
            setError(message);
            showToast(message, 'error');
            return;
        }

        if (password.length < 8) {
            const message = 'Password must be at least 8 characters.';
            setError(message);
            showToast(message, 'error');
            return;
        }

        if (!confirmPassword) {
            const message = 'Please confirm your password.';
            setError(message);
            showToast(message, 'error');
            return;
        }

        if (password !== confirmPassword) {
            const message = 'Passwords do not match.';
            setError(message);
            showToast(message, 'error');
            return;
        }

        /* ================================
           EMAIL VALIDATION
           ================================ */

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            const message = 'Please enter a valid email address.';
            setError(message);
            showToast(message, 'error');
            return;
        }

        /* ================================
           REGISTER USER
           ================================ */

        try {
            setLoading(true);

            const response = await fetch('/api/auth/register/', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    username: cleanUsername,
                    email: cleanEmail,
                    password: password,
                    password_confirm: confirmPassword
                })
            });

            const data = await response.json();

            /* ================================
               SERVER ERROR
               ================================ */

            if (!response.ok) {
                let message = 'Unable to create your account.';

                if (data.detail) {
                    message = data.detail;
                } else if (data.non_field_errors?.length) {
                    message = data.non_field_errors[0];
                } else {
                    const firstField = Object.keys(data)[0];

                    if (
                        firstField &&
                        Array.isArray(data[firstField])
                    ) {
                        message = data[firstField][0];
                    } else if (
                        firstField &&
                        typeof data[firstField] === 'string'
                    ) {
                        message = data[firstField];
                    }
                }

                setError(message);
                showToast(message, 'error');

                return;
            }

            /* ================================
               SUCCESS
               ================================ */

            showToast(
                'Account created successfully. Please sign in.',
                'success'
            );

            navigate('/login');

        } catch (error) {
            console.error('Registration error:', error);

            const message = 'Unable to connect to the server.';

            setError(message);
            showToast(message, 'error');

        } finally {
            setLoading(false);
        }
    };

    /* ================================
       PASSWORD REQUIREMENTS
       ================================ */

    const hasMinimumLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return (
        <main className="auth-page">

            <section className="auth-card">

                {/* ================================
                   BRAND
                   ================================ */}

                <div className="auth-brand">

                    <div className="auth-brand-icon">
                        N
                    </div>

                    <div>
                        <h1>NexaVault</h1>
                        <span>Personal workspace</span>
                    </div>

                </div>


                {/* ================================
                   HEADING
                   ================================ */}

                <div className="auth-heading">

                    <h2>Create your account</h2>

                    <p>
                        Create an account to start organizing your thoughts.
                    </p>

                </div>


                {/* ================================
                   REGISTER FORM
                   ================================ */}

                <form
                    className="auth-form"
                    onSubmit={handleRegister}
                >

                    {/* USERNAME */}

                    <div className="form-group">

                        <label htmlFor="register-username">
                            Username
                        </label>

                        <input
                            id="register-username"
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            autoComplete="username"
                            disabled={loading}
                            required
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="register-email">
                            Email
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            autoComplete="email"
                            disabled={loading}
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="register-password">
                            Password
                        </label>

                        <div className="password-input-wrapper">

                            <input
                                id="register-password"
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                autoComplete="new-password"
                                disabled={loading}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                disabled={loading}
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showPassword
                                    ? 'Hide'
                                    : 'Show'}
                            </button>

                        </div>


                        {/* PASSWORD REQUIREMENTS */}

                        <div className="password-hint">

                            <span
                                className={
                                    hasMinimumLength
                                        ? 'valid'
                                        : ''
                                }
                            >
                                {hasMinimumLength
                                    ? '✓'
                                    : '○'}{' '}
                                At least 8 characters
                            </span>

                            <span
                                className={
                                    hasUppercase
                                        ? 'valid'
                                        : ''
                                }
                            >
                                {hasUppercase
                                    ? '✓'
                                    : '○'}{' '}
                                One uppercase letter
                            </span>

                            <span
                                className={
                                    hasNumber
                                        ? 'valid'
                                        : ''
                                }
                            >
                                {hasNumber
                                    ? '✓'
                                    : '○'}{' '}
                                One number
                            </span>

                        </div>

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="register-confirm-password">
                            Confirm password
                        </label>

                        <div className="password-input-wrapper">

                            <input
                                id="register-confirm-password"
                                type={
                                    showConfirmPassword
                                        ? 'text'
                                        : 'password'
                                }
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(
                                        e.target.value
                                    );
                                    setError('');
                                }}
                                autoComplete="new-password"
                                disabled={loading}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                disabled={loading}
                                aria-label={
                                    showConfirmPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showConfirmPassword
                                    ? 'Hide'
                                    : 'Show'}
                            </button>

                        </div>

                    </div>


                    {/* ERROR MESSAGE */}

                    {error && (
                        <div className="auth-error">

                            <span className="auth-error-icon">
                                !
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    {/* SUBMIT BUTTON */}

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >

                        {loading ? (
                            <>
                                <span className="button-spinner"></span>

                                Creating account...
                            </>
                        ) : (
                            'Create account'
                        )}

                    </button>

                </form>


                {/* LOGIN LINK */}

                <div className="auth-switch">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Sign in
                    </Link>

                </div>

            </section>

        </main>
    );
};

export default RegisterPage;