import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { useEffect, useState } from "react";

import './App.css';

import Header from './components/header';
import NotesListPage from './pages/NotesListPage';
import NotePage from './pages/NotePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ToastProvider, useToast } from './components/Toast';
import { apiFetch, logout } from './api';


function ProtectedRoute({ children }) {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        let mounted = true;

        const checkAuthentication = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                if (mounted) {
                    setAuthenticated(false);
                    setCheckingAuth(false);
                }
                return;
            }

            try {
                const response = await apiFetch('/auth/me/');

                if (response.ok) {
                    if (mounted) {
                        setAuthenticated(true);
                    }
                    return;
                }

                if (response.status === 401) {
                    logout();

                    if (mounted) {
                        setAuthenticated(false);

                        showToast(
                            'Your session has expired. Please log in again.',
                            'error'
                        );
                    }

                    return;
                }

                if (mounted) {
                    setAuthenticated(false);
                }

            } catch (error) {
                console.error('Authentication check failed:', error);

                if (mounted) {
                    setAuthenticated(false);
                }

            } finally {
                if (mounted) {
                    setCheckingAuth(false);
                }
            }
        };

        checkAuthentication();

        return () => {
            mounted = false;
        };
    }, [showToast]);

    if (checkingAuth) {
        return (
            <div className="route-loading">
                <div className="loading-spinner"></div>
                <p>Checking your session...</p>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}


function App() {

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });


    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);


    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === 'dark' ? 'light' : 'dark'
        );
    };


    return (
        <ToastProvider>
            <Router>

                <div className={`container ${theme}`}>

                    <div className="app">

                        <Header
                            theme={theme}
                            toggleTheme={toggleTheme}
                        />

                        <Routes>

                            <Route
                                path="/login"
                                element={<LoginPage />}
                            />

                            <Route
                                path="/register"
                                element={<RegisterPage />}
                            />

                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <NotesListPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/note/:id"
                                element={
                                    <ProtectedRoute>
                                        <NotePage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="*"
                                element={
                                    <Navigate to="/login" replace />
                                }
                            />

                        </Routes>

                    </div>

                </div>

            </Router>
        </ToastProvider>
    );
}


export default App;