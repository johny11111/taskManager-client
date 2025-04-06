const API_URL = 'https://taskmanager-server-ygfb.onrender.com/api/users';
//const API_URL = 'http://localhost:5000/api/users';


export const registerUser = async ({ name, email, password, token }) => {
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, token })
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return { message: "שגיאה בהרשמה" };
    }
};

export const loginUser = async (userData) => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
    }

    return res.json();
};

export const logoutUser = async () => {
    const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    return res.json();
};

export const getMe = async () => {
    const res = await fetch(`${API_URL}/me`, {
        credentials: 'include', 
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`❌ שגיאה בשליפת המשתמש: ${res.status} - ${text}`);
    }

    return res.json();
};

export const refreshToken = async () => {
    try {
        const res = await fetch(`${API_URL}/refresh`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to refresh token');

        const data = await res.json();
        return data.user;
    } catch (err) {
        console.error('🔁 שגיאה ברענון טוקן:', err);
        return null;
    }
};

