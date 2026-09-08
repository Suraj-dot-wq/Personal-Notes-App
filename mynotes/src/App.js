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


// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute({ children }) {

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    const { showToast } = useToast();


    useEffect(() => {

        let mounted = true;


        const checkAuthentication = async () => {

            const token = localStorage.getItem('access_token');


            // ------------------------------------------------
            // No access token
            // ------------------------------------------------

            if (!token) {

                if (mounted) {
                    setAuthenticated(false);
                    setCheckingAuth(false);
                }

                return;
            }


            // ------------------------------------------------
            // Check token with Django
            // ------------------------------------------------

            try {

                const response = await apiFetch('/auth/me/');


                // --------------------------------------------
                // Valid token
                // --------------------------------------------

                if (response.ok) {

                    if (mounted) {
                        setAuthenticated(true);
                        setCheckingAuth(false);
                    }

                    return;
                }


                // --------------------------------------------
                // Invalid / expired token
                // --------------------------------------------

                if (response.status === 401) {

                    logout();

                    if (mounted) {

                        setAuthenticated(false);
                        setCheckingAuth(false);

                        showToast(
                            'Your session has expired. Please log in again.',
                            'error'
                        );
                    }

                    return;
                }


                // --------------------------------------------
                // Other server errors
                // --------------------------------------------

                if (mounted) {

                    setAuthenticated(false);
                    setCheckingAuth(false);
                }

            } catch (error) {

                console.error(
                    'Authentication check failed:',
                    error
                );

                if (mounted) {

                    setAuthenticated(false);
                    setCheckingAuth(false);
                }
            }
        };


        checkAuthentication();


        // Cleanup
        return () => {
            mounted = false;
        };

    }, [showToast]);


    // ========================================================
    // AUTHENTICATION CHECK LOADING
    // ========================================================

    if (checkingAuth) {

        return (
            <div className="route-loading">

                <div className="loading-spinner"></div>

                <p>
                    Checking your session...
                </p>

            </div>
        );
    }


    // ========================================================
    // NOT AUTHENTICATED
    // ========================================================

    if (!authenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // ========================================================
    // AUTHENTICATED
    // ========================================================

    return children;
}


// ============================================================
// MAIN APP
// ============================================================

function App() {


    // ========================================================
    // THEME
    // ========================================================

    const [theme, setTheme] = useState(() => {

        return (
            localStorage.getItem('theme') ||
            'dark'
        );

    });


    // Save theme preference
    useEffect(() => {

        localStorage.setItem(
            'theme',
            theme
        );

    }, [theme]);


    // Toggle dark/light mode
    const toggleTheme = () => {

        setTheme((currentTheme) => {

            return currentTheme === 'dark'
                ? 'light'
                : 'dark';

        });

    };


    // ========================================================
    // APPLICATION UI
    // ========================================================

    return (

        <ToastProvider>

            <Router>

                <div
                    className={`container ${theme}`}
                >

                    <div className="app">


                        {/* ==================================
                            HEADER
                        ================================== */}

                        <Header
                            theme={theme}
                            toggleTheme={toggleTheme}
                        />


                        {/* ==================================
                            ROUTES
                        ================================== */}

                        <Routes>


                            {/* =================================
                                LOGIN
                            ================================= */}

                            <Route
                                path="/login"
                                element={
                                    <LoginPage />
                                }
                            />


                            {/* =================================
                                REGISTER
                            ================================= */}

                            <Route
                                path="/register"
                                element={
                                    <RegisterPage />
                                }
                            />


                            {/* =================================
                                DASHBOARD / NOTES
                            ================================= */}

                            <Route
                                path="/"
                                element={

                                    <ProtectedRoute>

                                        <NotesListPage />

                                    </ProtectedRoute>

                                }
                            />


                            {/* =================================
                                SINGLE NOTE
                            ================================= */}

                            <Route
                                path="/note/:id"
                                element={

                                    <ProtectedRoute>

                                        <NotePage />

                                    </ProtectedRoute>

                                }
                            />


                            {/* =================================
                                UNKNOWN ROUTE
                            ================================= */}

                            <Route
                                path="*"
                                element={
                                    <Navigate
                                        to="/login"
                                        replace
                                    />
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
