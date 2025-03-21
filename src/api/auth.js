//const API_URL = 'https://taskmanager-server-ygfb.onrender.com/api/users';
const API_URL = 'http://localhost:5000/api/users';


export const registerUser = async (userData) => {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return res.json();
};

export const loginUser = async (userData) => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    
    if (!res.ok) {
        throw new Error('Login failed');
    }

    return res.json(); // מחזיר { token, user }
};

export const getAllUsers = async () => {
    const token = localStorage.getItem('token'); // או מאיפה שאתה שומר את ה-JWT
    if (!token) {
        throw new Error('No token found');
    }

    const res = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
    }

    return res.json();
};
