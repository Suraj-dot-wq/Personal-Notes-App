import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch, logout } from '../api';

const Header = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(
        Boolean(localStorage.getItem('access_token'))
    );

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        setIsLoggedIn(Boolean(token));

        if (!token) {
            setUser(null);
            return;
        }

        const getUser = async () => {
            try {
                const response = await apiFetch('/auth/me/');

                if (response.ok) {
                    const data = await response.json();

                    setUser(data);
                    setIsLoggedIn(true);
                } else if (response.status === 401) {
                    logout();

                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Unable to load user:', error);
            }
        };

        getUser();

    }, [location.pathname]);


    const handleLogout = () => {
        logout();

        setUser(null);
        setIsLoggedIn(false);

        navigate('/login');
    };


    return (
        <header className="app-header">

            <div className="brand">
                <div className="brand-icon">
                    N
                </div>

                <div>
                    <h1>NexaVault</h1>
                    <span>Personal workspace</span>
                </div>
            </div>


            <div className="header-right">

                {/* Theme Toggle */}
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    type="button"
                    aria-label={
                        theme === 'dark'
                            ? 'Switch to light mode'
                            : 'Switch to dark mode'
                    }
                    title={
                        theme === 'dark'
                            ? 'Switch to light mode'
                            : 'Switch to dark mode'
                    }
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>


                {isLoggedIn && (
                    <>

                        {user && (
                            <div className="user-info">

                                <div className="avatar">
                                    {user.username
                                        ? user.username
                                            .charAt(0)
                                            .toUpperCase()
                                        : 'U'}
                                </div>

                                <div className="user-name">
                                    <strong>{user.username}</strong>
                                    <span>Personal account</span>
                                </div>

                            </div>
                        )}


                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </>
                )}

            </div>

        </header>
    );
};

export default Header;