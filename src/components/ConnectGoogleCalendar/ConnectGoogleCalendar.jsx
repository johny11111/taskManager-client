import React, { useEffect, useState } from 'react';
import { AiOutlineCalendar } from "react-icons/ai";
import styles from './ConnectGoogleCalendar.module.css';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

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

  // 📦 בדפדפן רגיל
  useEffect(() => {
    const hash = window.location.hash;
    const queryString = hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(queryString);
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

        const hashOnly = window.location.hash.split('?')[0];
        window.history.replaceState({}, '', window.location.pathname + hashOnly);
      } catch (err) {
        console.error("❌ שגיאה בשליפת המשתמש המעודכן:", err);
      }
    };

    if (isCalendarConnected || !localStorage.getItem("user")) {
      fetchUpdatedUser();
    }
  }, []);

  // 📱 באפליקציה – מאזין להפניה חזרה
  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      console.log("📲 appUrlOpen:", url);

      if (url.includes('calendar_connected=true')) {
        await Browser.close();

        try {
          const res = await fetch("https://taskmanager-server-ygfb.onrender.com/api/users/me", {
            credentials: 'include'
          });

          const updatedUser = await res.json();
          if (updatedUser?._id) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            alert("🎉 התחברת ליומן בהצלחה!");
          }
        } catch (err) {
          console.error("❌ שגיאה בשליפת המשתמש:", err);
        }

        window.location.href = '/#/teams';
      }
    });
  }, []);

  const handleConnect = async () => {
    const userId = user?._id || user?.id;
    if (!userId) return alert("משתמש לא נמצא");

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = 'https://taskmanager-server-ygfb.onrender.com/api/google/calendar/callback';
    const scope = 'https://www.googleapis.com/auth/calendar';

    const isApp = Capacitor.isNativePlatform();

    const state = encodeURIComponent(JSON.stringify({
      userId,
      returnTo: '/teams',
      platform: isApp ? 'app' : 'web'
    }));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;

    await Browser.open({
      url: authUrl,
      windowName: "_system"
    });
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
