import React, { useEffect, useState } from 'react';
import { syncOpenTasksToCalendar } from '../api/tasks';

const ConnectGoogleCalendar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const calendarWasAlreadyConnected = localStorage.getItem("calendar_connected");

    if (calendarWasAlreadyConnected) {
      localStorage.removeItem("calendar_connected");

      const confirmSync = window.confirm("📅 היומן חובר בהצלחה! האם תרצה לסנכרן את כל המשימות הפתוחות ליומן?");
      if (confirmSync) {
        syncOpenTasksToCalendar()
          .then(() => alert("✅ כל המשימות הפתוחות סונכרנו ליומן שלך"))
          .catch((err) => {
            console.error("❌ שגיאה בסנכרון משימות ליומן:", err);
            alert("שגיאה בסנכרון המשימות ליומן");
          });
      }
    }
  }, []);

  const handleConnect = () => {
    const userId = user?._id || user?.id;
    if (!userId) return alert("משתמש לא נמצא");

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = 'https://taskmanager-server-ygfb.onrender.com/api/google/calendar/callback';
    const scope = 'https://www.googleapis.com/auth/calendar';

    localStorage.setItem("calendar_connected", "true");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${userId}`;

    window.location.href = authUrl;
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      {!user?.googleCalendar?.access_token ? (
        <button onClick={handleConnect}>
          📅 חבר את היומן שלי ל-Google Calendar
        </button>
      ) : (
        <p>✔ היומן שלך כבר מחובר</p>
      )}
    </div>
  );
};

export default ConnectGoogleCalendar;
