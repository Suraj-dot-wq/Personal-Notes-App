const API_BASE = '/api';

export const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

export const setTokens = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

const refreshAccessToken = async () => {
    const refresh = localStorage.getItem('refresh_token');

    if (!refresh) {
        return false;
    }

    const response = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            refresh: refresh
        })
    });

    if (!response.ok) {
        logout();
        return false;
    }

    const data = await response.json();

    localStorage.setItem('access_token', data.access);

    if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
    }

    return true;
};

export const apiFetch = async (url, options = {}) => {
    let token = getAccessToken();

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    // Access token expired → try refreshing it
    if (response.status === 401 && token) {
        const refreshed = await refreshAccessToken();

        if (!refreshed) {
            return response;
        }

        token = getAccessToken();

        headers['Authorization'] = `Bearer ${token}`;

        response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers
        });
    }

    return response;
};