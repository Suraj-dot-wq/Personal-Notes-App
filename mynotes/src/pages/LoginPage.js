import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setTokens } from '../api';
import { useToast } from '../components/Toast';

const LoginPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        setError('');

        const cleanUsername = username.trim();

        if (!cleanUsername || !password) {
            const message = 'Please enter your username and password.';

            setError(message);
            showToast(message, 'error');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: cleanUsername,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                let message = 'Invalid username or password.';

                if (data.detail) {
                    message = data.detail;
                } else if (data.non_field_errors?.length) {
                    message = data.non_field_errors[0];
                }

                setError(message);
                showToast(message, 'error');
                return;
            }

            if (!data.access || !data.refresh) {
                const message = 'Login response did not contain valid tokens.';

                setError(message);
                showToast(message, 'error');
                return;
            }

            setTokens(data.access, data.refresh);

            showToast('Login successful. Welcome back!', 'success');

            navigate('/');

        } catch (error) {
            console.error('Login error:', error);

            const message = 'Unable to connect to the server.';

            setError(message);
            showToast(message, 'error');

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">

            <section className="auth-card">

                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        N
                    </div>

                    <div>
                        <h1>NexaVault</h1>
                        <span>Personal workspace</span>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>Welcome back</h2>

                    <p>
                        Sign in to continue to your personal workspace.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleLogin}
                >

                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
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

                    <div className="form-group">

                        <div className="password-label-row">
                            <label htmlFor="password">
                                Password
                            </label>
                        </div>

                        <div className="password-input-wrapper">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                autoComplete="current-password"
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
                                {showPassword ? 'Hide' : 'Show'}
                            </button>

                        </div>

                    </div>

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

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >

                        {loading ? (
                            <>
                                <span className="button-spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}

                    </button>

                </form>

                <div className="auth-switch">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create account
                    </Link>

                </div>

            </section>

        </main>
    );
};

export default LoginPage;