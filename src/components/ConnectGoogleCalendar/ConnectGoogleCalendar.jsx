import React, { useEffect, useState } from 'react';
import {AiOutlineCalendar} from "react-icons/ai"
import styles from './ConnectGoogleCalendar.module.css';
import { Browser } from '@capacitor/browser';


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
        const res = await fetch("https://taskmanager-server-ygfb.onrender.com/api/users/me", {
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
          const syncRes = await fetch("https://taskmanager-server-ygfb.onrender.com/api/tasks/sync-google-calendar", {
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
  


  const handleConnect = async () => {
    const userId = user?._id || user?.id;
    if (!userId) return alert("משתמש לא נמצא");
  
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = 'https://taskmanager-server-ygfb.onrender.com/api/google/calendar/callback';
    const scope = 'https://www.googleapis.com/auth/calendar';
  
    const state = encodeURIComponent(JSON.stringify({
      userId,
      returnTo: '/teams',
      platform: 'app'  // 💡 אל תנסה לזהות - קבוע כשאתה ב־Capacitor
    }));
  
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;
  
    // 👇 פותח את Google Login בתוך In-App Browser
    await Browser.open({ url: authUrl });
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
