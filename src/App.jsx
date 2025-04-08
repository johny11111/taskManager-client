// 📁 App.jsx
import { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register/Register';
import ConnectGoogleCalendar from './components/ConnectGoogleCalendar/ConnectGoogleCalendar';
import TeamsPage from './pages/TeamsPage/TeamsPage';
import Dashboard from './pages/Dashboard/Dashboard';
import { UserContext } from './context/UserContext';
import './index.css';
import styles from './App.module.css';
import { logoutUser, getMe } from './api/auth';
import OAuth2Callback from './pages/OAuth2Callback'
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { Toaster } from 'react-hot-toast';



function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'enabled');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } else {
        // 🔁 בדיקה גם מ־Capacitor
        const prefUser = await Preferences.get({ key: 'user' });
        if (prefUser.value) {
          const parsed = JSON.parse(prefUser.value);
          setUser(parsed);
          localStorage.setItem('user', JSON.stringify(parsed)); // לשימוש רגיל
          setLoading(false);
          return;
        }

        try {
          let res;
          try {
            res = await getMe();
          } catch (err) {
            console.warn("🔄 הטוקן פג תוקף, מנסה לרענן...");
            res = await refreshToken();
          }

          if (res?._id) {
            setUser(res);
            localStorage.setItem('user', JSON.stringify(res));
            await Preferences.set({ key: 'user', value: JSON.stringify(res) });
          } else {
            throw new Error('No valid user');
          }
        } catch (err) {
          console.warn('❌ לא אותר משתמש מהשרת');
          setUser(null);
          localStorage.removeItem('user');
          await Preferences.remove({ key: 'user' });
          window.location.href = "/#/login";
        } finally {
          setLoading(false);
        }
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      if (url.includes('/oauth2callback')) {
        const urlObj = new URL(url);
        const isCalendarConnected = urlObj.searchParams.get('calendar_connected');

        await Browser.close(); // סגירת הדפדפן
        window.location.href = `/#/teams${isCalendarConnected ? '?calendar_connected=true' : ''}`;
      }
    });
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'disabled');
    }
  }, [darkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      const fetchUser = async () => {
        try {
          const res = await getMe(); // בדיקת עוגייה מהשרת
          if (res?._id) {
            setUser(res);
            localStorage.setItem('user', JSON.stringify(res));
          } else {
            throw new Error('No valid user');
          }
        } catch (err) {
          console.warn('❌ לא אותר משתמש מהשרת');
          setUser(null);
          localStorage.removeItem('user');
          window.location.href = "/#/login"; // 🔁 כאן הניווט האוטומטי
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, []);




  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout failed:', err);
    }

    localStorage.removeItem('user');
    await Preferences.remove({ key: 'user' }); // 🧹 ניקוי גם מה־Capacitor

    setUser(null);
    setToken(null);
    setSelectedTeam(null);

    window.location.href = '/#/login';
  };


  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>טוען משתמש...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser, token, selectedTeam, setSelectedTeam, darkMode }}>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <header className={`navbar-custom ${darkMode ? styles.navbarDark : styles.navbarLight}`}>
          <div className={styles.container}>
            {
              user && <ConnectGoogleCalendar />
            }

            <Link to="/" className={styles.brand}>Task Manager</Link>
            <button className={styles.hamburger} onClick={() => setMenuOpen(prev => !prev)}>
              ☰
            </button>

            <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
              {!user ? (
                <>
                  <Link to="/login" className={styles.navLink} onClick={() => setMenuOpen(false)}>🔑 התחברות</Link>
                  <Link to="/register" className={styles.navLink} onClick={() => setMenuOpen(false)}>📝 הרשמה</Link>
                </>
              ) : (
                <>
                  <button
                    className={`${styles.button} ${styles.fullWidth}`}
                    onClick={() => {
                      setDarkMode(!darkMode);
                      setMenuOpen(false);
                    }}
                  >
                    {darkMode ? '☀️ מצב בהיר' : '🌙 מצב כהה'}
                  </button>
                  <button
                    className={`${styles.button} ${styles.outlineButton} ${styles.fullWidth} ${styles.logOutBtn}`}
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                  >
                    🚪 התנתק
                  </button>
                </>
              )}
            </nav>

          </div>
        </header>

        <Routes>
          <Route
            path="/login"
            element={<Login setUser={setUser} headerHeight={headerHeight} />}
          />
          <Route path="/oauth2callback" element={<OAuth2Callback />} />
          <Route path="/register" element={<Register headerHeight={headerHeight} />} />
          <Route path="/teams" element={user ? <TeamsPage /> : <Navigate to="/login" />} />
          <Route path="/dashboard/:teamId" element={<Dashboard />} />
          <Route path="/" element={user ? <Navigate to="/teams" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );

}

export default App;
