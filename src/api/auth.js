const API_URL = 'https://taskmanager-server-ygfb.onrender.com/api/users';
// API_URL = 'https://taskmanager-server-ygfb.onrender.com/api/users';
//const API_URL = 'http://localhost:5000/api/users';


export const registerUser = async ({ name, email, password, token }) => {
    try {
        const res = await fetch('https://taskmanager-server-ygfb.onrender.com/api/users/register', {
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
        credentials: 'include', // ⬅️ חובה בשביל לקבל את ה-cookie
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

// 📌 הבאת המשתמש המחובר לפי העוגייה
export const getMe = async () => {
    const res = await fetch('https://taskmanager-server-ygfb.onrender.com/api/users/me', {
      credentials: 'include', // שולח את העוגייה עם הבקשה
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`❌ שגיאה בשליפת המשתמש: ${res.status} - ${text}`);
    }
  
    return res.json();
  };
  
