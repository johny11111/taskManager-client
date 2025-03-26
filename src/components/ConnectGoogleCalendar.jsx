import React, { useEffect, useState } from 'react';

const ConnectGoogleCalendar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("שגיאה בפריסת המשתמש מה־localStorage:", err);
      }
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isCalendarConnected = urlParams.get("calendar_connected");

    if (isCalendarConnected) {
      const fetchUpdatedUser = async () => {
        try {
          const res = await fetch("https://taskmanager-server-ygfb.onrender.com/api/users/me", {
            credentials: 'include' // ✅ טוקן מגיע מעוגייה
          });

          const updatedUser = await res.json();
          if (!updatedUser || !updatedUser._id) {
            console.error("❌ לא התקבל משתמש מעודכן");
            return;
          }

          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);

          const shouldSync = window.confirm("🎉 התחברת ליומן בהצלחה! רוצה להוסיף את המשימות הפתוחות ליומן Google?");
          if (shouldSync) {
            const syncRes = await fetch("https://taskmanager-server-ygfb.onrender.com/api/tasks/sync-google-calendar", {
              method: "POST",
              credentials: 'include', // ✅ גם כאן
              headers: {
                "Content-Type": "application/json"
              }
            });

            if (!syncRes.ok) {
              const errText = await syncRes.text();
              console.error("❌ שגיאה בסנכרון משימות ליומן:", errText);
            } else {
              alert("✨ כל המשימות הפתוחות נוספו ליומן שלך");
            }
          }

          // 🧼 הסרת הפרמטר מה-URL
          window.history.replaceState({}, '', window.location.pathname + window.location.hash);

        } catch (err) {
          console.error("❌ שגיאה בשליפת המשתמש המעודכן:", err);
        }
      };

      fetchUpdatedUser();
    }
  }, []);

  const handleConnect = () => {
    const userId = user?._id || user?.id;
    if (!userId) return alert("משתמש לא נמצא");

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = 'https://taskmanager-server-ygfb.onrender.com/api/google/calendar/callback';
    const scope = 'https://www.googleapis.com/auth/calendar';

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
