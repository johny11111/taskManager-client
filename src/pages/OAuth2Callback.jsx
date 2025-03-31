import { useEffect } from 'react';
import { Browser } from '@capacitor/browser';

const OAuth2Callback = () => {
  useEffect(() => {
    // תומך גם ב־hash וגם ב־search
    const fullQuery = window.location.search || window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(fullQuery);

    const platform = urlParams.get("platform");
    const isCalendarConnected = urlParams.get("calendar_connected");

    const redirectTo = `/#/teams${isCalendarConnected ? '?calendar_connected=true' : ''}`;

    if (platform === 'app') {
      Browser.close()
        .then(() => window.location.href = redirectTo)
        .catch(() => window.location.href = redirectTo);
    } else {
      window.location.href = redirectTo;
    }
  }, []);

  return <p>🔄 מסיים התחברות ליומן Google...</p>;
};

export default OAuth2Callback;
