import { useState } from 'react';
import { loginUser } from '../../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';

const Login = ({ setUser, headerHeight }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const containerHeight = `calc(100dvh - ${headerHeight}px)`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginUser({ email, password });

      if (data.user) {
        const user = data.user;
        const userId = user._id || user.id;

        setUser(user);
        await Preferences.set({ key: 'user', value: JSON.stringify(user) });
        navigate('/teams');
        if (!user.googleCalendar?.access_token && !localStorage.getItem("declinedGoogleCalendar")) {
          const wantsToConnect = window.confirm("רוצה לחבר את היומן כדי לראות משימות ביומן Google?");
          if (wantsToConnect) {
            await connectToGoogleCalendar(userId);
            return;
          } else {
            localStorage.setItem("declinedGoogleCalendar", "true");
          }
        }

      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const connectToGoogleCalendar = async (userId) => {
    if (!userId) {
      console.error("❌ לא ניתן להתחבר ליומן – userId חסר");
      return;
    }

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

    await Browser.open({ url: authUrl, windowName: "_system" });
  };

  return (
    <div className={styles.containerLogin} style={{ minHeight: containerHeight }}>
      <div className={styles.card}>
        <h2 className={styles.title}>התחברות</h2>

        {error && <div className={styles.alert}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">אימייל</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">סיסמה</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className={styles.togglePassword}
                aria-label="הצג/הסתר סיסמה"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.btnLogin}>התחבר/י</button>
        </form>

        <p className={styles.footerText}>
          אין לך חשבון? <Link to="/register" className={styles.link}>הרשמה</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;