import { useEffect } from 'react';

const OAuth2Callback = () => {
  useEffect(() => {
    const fullQuery = window.location.search || window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(fullQuery);
    const isCalendarConnected = urlParams.get("calendar_connected");
    const redirectTo = `/#/teams${isCalendarConnected ? '?calendar_connected=true' : ''}`;

    window.location.href = redirectTo;

  }, []);

  return <p>🔄 מסיים התחברות ליומן Google...</p>;
};

export default OAuth2Callback;
