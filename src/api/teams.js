//const TEAM_API_URL = 'http://localhost:5000/api/users/teams';
const TEAM_API_URL = 'https://taskmanager-server-ygfb.onrender.com/api/users/teams';

/** 📌 יצירת צוות חדש */
export const createTeam = async (teamData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const res = await fetch(`${TEAM_API_URL}/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teamData)
        });

        if (!res.ok) throw new Error('Failed to create team');

        return await res.json();
    } catch (error) {
        console.error("❌ Error creating team:", error);
        throw error;
    }
};

/** 📌 שליפת כל הצוותים */
export const getTeams = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const res = await fetch('http://localhost:5000/api/users/teams', { // ✅ שם הנתיב עודכן
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to fetch teams');

    return res.json();
};


/** 📌 הוספת משתמש לצוות */
export const addUserToTeam = async (teamId, userId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const res = await fetch(`${TEAM_API_URL}/${teamId}/addUser`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (!res.ok) throw new Error('Failed to add user to team');

        return await res.json();
    } catch (error) {
        console.error("❌ Error adding user to team:", error);
        throw error;
    }
};
