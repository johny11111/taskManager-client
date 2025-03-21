//const API_URL = 'http://localhost:5000/api/tasks';
const API_URL = 'https://taskmanager-server-ygfb.onrender.com/api/tasks';
//const USERS_API_URL = 'http://localhost:5000/api/users'; 
const USERS_API_URL = 'https://taskmanager-server-ygfb.onrender.com/api/users'; 

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error("❌ No authentication token found.");
        throw new Error('No authentication token found');
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// 📌 הבאת המשימות של המשתמש המחובר בלבד
export const getTasks = async () => {
    try {
        const res = await fetch(API_URL, { headers: getAuthHeaders() });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Failed to fetch tasks: ${res.status} - ${errorText}`);
            throw new Error(`Failed to fetch tasks: ${res.status} - ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        throw error;
    }
};



// 📌 הבאת רשימת המשתמשים
export const getUsers = async () => {
    try {
        const res = await fetch(`${USERS_API_URL}/all`, { headers: getAuthHeaders() });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Failed to fetch users: ${res.status} - ${errorText}`);
            throw new Error(`Failed to fetch users: ${res.status} - ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
    }
};

// 📌 יצירת משימה חדשה
export const createTaskForTeam = async (teamId, taskData) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }

    console.log(`📤 שולח משימה לצוות: ${teamId}`);

    const res = await fetch(`${API_URL}/team/${teamId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ שגיאה ביצירת משימה לצוות: ${res.status} - ${errorText}`);
        throw new Error(`Failed to create task for team: ${res.status}`);
    }

    return res.json();
};


// 📌 עדכון סטטוס של משימה
export const updateTaskStatus = async (id, status) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Failed to update task status: ${res.status} - ${errorText}`);
        throw new Error(`Failed to update task status: ${res.status} - ${errorText}`);
    }
    return res.json();
};

// 📌 מחיקת משימה
export const deleteTask = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Failed to delete task: ${res.status} - ${errorText}`);
            throw new Error(`Failed to delete task: ${res.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        throw error;
    }
};

export const getTeamById = async (teamId) => {
    const token = localStorage.getItem('token'); // שליפת הטוקן עבור אימות
    if (!token) {
        throw new Error('No token found');
    }

    const res = await fetch(`${USERS_API_URL}/teams/${teamId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch team details: ${res.status}`);
    }

    return res.json();
};

export const getTasksByTeam = async (teamId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }

    console.log(`📡 מבקש משימות עבור צוות: ${teamId}`);

    const res = await fetch(`${API_URL}/team/${teamId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ שגיאה בשליפת משימות הצוות: ${res.status} - ${errorText}`);
        throw new Error(`Failed to fetch team tasks: ${res.status}`);
    }

    const data = await res.json();
    console.log(`📥 התקבלו ${data.length} משימות מהשרת`);
    return data;
};



