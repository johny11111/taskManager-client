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
    const res = await fetch(API_URL, {
      method: 'GET',
      credentials: 'include'
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Failed to fetch tasks: ${res.status} - ${errorText}`);
      throw new Error(`Failed to fetch tasks: ${res.status} - ${errorText}`);
    }
  
    return res.json();
  };
  
// 📌 הבאת רשימת המשתמשים
// export const getUsers = async () => {
//     try {
//         const res = await fetch(`${USERS_API_URL}/all`, { headers: getAuthHeaders() });

//         if (!res.ok) {
//             const errorText = await res.text();
//             console.error(`❌ Failed to fetch users: ${res.status} - ${errorText}`);
//             throw new Error(`Failed to fetch users: ${res.status} - ${errorText}`);
//         }
//         return res.json();
//     } catch (error) {
//         console.error('❌ Error fetching users:', error);
//         throw error;
//     }
// };

export const getTeamMembers = async (teamId) => {
    const res = await fetch(`${USERS_API_URL}/team-members?teamId=${teamId}`, {
      method: 'GET',
      credentials: 'include'
    });
  
    if (!res.ok) throw new Error('שגיאה בקבלת חברי הצוות');
  
    return res.json();
  };


// 📌 יצירת משימה חדשה
export const createTaskForTeam = async (teamId, taskData) => {
    console.log(`📤 שולח משימה לצוות: ${teamId}`);
  
    const res = await fetch(`${API_URL}/team/${teamId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
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
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Failed to update task status: ${res.status} - ${errorText}`);
      throw new Error(`Failed to update task status: ${res.status} - ${errorText}`);
    }
  
    return res.json();
  };

export const updateTask = async (taskId, updatedData) => {
    const res = await fetch(`${API_URL}/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(updatedData)
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Failed to update task: ${res.status} - ${errorText}`);
      throw new Error(`Failed to update task: ${res.status} - ${errorText}`);
    }
  
    return res.json();
  };

// 📌 מחיקת משימה
export const deleteTask = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Failed to delete task: ${res.status} - ${errorText}`);
      throw new Error(`Failed to delete task: ${res.status} - ${errorText}`);
    }
  };

export const getTeamById = async (teamId) => {
    const res = await fetch(`${USERS_API_URL}/teams/${teamId}`, {
      method: 'GET',
      credentials: 'include'
    });
  
    if (!res.ok) {
      throw new Error(`Failed to fetch team details: ${res.status}`);
    }
  
    return res.json();
  };

  export const getTasksByTeam = async (teamId) => {
    console.log(`📡 מבקש משימות עבור צוות: ${teamId}`);

    const res = await fetch(`${API_URL}/team/${teamId}`, {
        method: 'GET',
        credentials: 'include' // ✅ שולח את ה-cookie עם ה-JWT
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



