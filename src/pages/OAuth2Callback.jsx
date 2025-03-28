import { useEffect } from 'react';

const OAuth2Callback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get("platform");
    const isCalendarConnected = urlParams.get("calendar_connected");

    if (platform === 'app') {
      // 👇 מפנה חזרה לאפליקציה
      window.location.href = 'capacitor://localhost';
    } else {
      // 👇 הפניה חזרה לאתר עם פרמטר
      window.location.href = `/#/teams${isCalendarConnected ? '?calendar_connected=true' : ''}`;
    }
  }, []);

  return <p>🔄 מסיים התחברות ליומן Google...</p>;
};

export default OAuth2Callback;
