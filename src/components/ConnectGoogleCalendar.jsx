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
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const res = await fetch("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedUser = await res.json();
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);

          // 🟡 לאחר התחברות – לשאול על סנכרון משימות פתוחות
          const shouldSync = window.confirm("התחברת בהצלחה ליומן 🎉 האם להוסיף את כל המשימות הפתוחות ליומן Google?");
          if (shouldSync) {
            await fetch("http://localhost:5000/api/tasks/sync-google-calendar", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            });
            alert("✨ כל המשימות הפתוחות נוספו ליומן שלך");
          }

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

    const clientId = '1090097729918-dvlvjh943fm5l90rv9222pkgj6b3sbrn.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:5000/api/google/calendar/callback';
    const scope = 'https://www.googleapis.com/auth/calendar';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(
      scope
    )}&access_type=offline&prompt=consent&state=${userId}`;

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
