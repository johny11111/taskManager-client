import React, { useEffect, useState } from 'react';
import {AiOutlineCalendar} from "react-icons/ai"
import styles from './ConnectGoogleCalendar.module.css';

const ConnectGoogleCalendar = () => {
  const [user, setUser] = useState(null);
  const isConnected = user?.googleCalendar?.access_token;

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
  
    const fetchUpdatedUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          credentials: 'include'
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
          const syncRes = await fetch("http://localhost:5000/api/tasks/sync-google-calendar", {
            method: "POST",
            credentials: 'include',
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
        const hash = window.location.hash; // שומר את ה-hash (/teams)
        window.history.replaceState({}, '', window.location.pathname + hash);
  
      } catch (err) {
        console.error("❌ שגיאה בשליפת המשתמש המעודכן:", err);
      }
    };
  
    // תמיד ננסה למשוך את המשתמש אם העוגייה קיימת
    if (isCalendarConnected || !localStorage.getItem("user")) {
      fetchUpdatedUser();
    }
  }, []);
  

  const handleConnect = () => {
    const userId = user?._id || user?.id;
    if (!userId) return alert("משתמש לא נמצא");
  
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:5000/api/google/calendar/callback';
    const scope = 'https://www.googleapis.com/auth/calendar';
  
    const state = encodeURIComponent(JSON.stringify({
      userId,
      returnTo: '/teams' 
    }));
  
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;
  
    window.location.href = authUrl;
  };
  

  return (
    <div className={styles.floatingWrapper}>
      <button
        className={styles.floatingButton}
        onClick={handleConnect}
        disabled={isConnected}
      >
        <AiOutlineCalendar size={20} />
        <span className={styles.tooltip}>
          {isConnected ? 'היומן מחובר' : 'התחבר ליומן Google'}
        </span>
      </button>
    </div>
  );
  
};

export default ConnectGoogleCalendar;
