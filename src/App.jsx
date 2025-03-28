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



function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'enabled');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  // const navigate = useNavigate()



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
    if(!storedUser){
      // Navigate('/login')
      console.log("no user stored");
      
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
     
      const fetchUser = async () => {
        try {
          const res = await getMe(); // מחזיר את המשתמש לפי העוגייה
          if (res?._id) {
            setUser(res);
            localStorage.setItem('user', JSON.stringify(res));
          }
        } catch (err) {
          console.warn('❌ לא אותר משתמש מהשרת');
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
      navigate("/login")
    } catch (err) {
      console.error('Logout failed:', err);
    }

    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setSelectedTeam(null);
   
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
    <UserContext.Provider value={{ user, setUser, token, selectedTeam, setSelectedTeam , darkMode }}>
      <Router>
        <header className={`navbar-custom ${darkMode ? styles.navbarDark : styles.navbarLight}`}>
          <div className={styles.container}>
            {
              user &&  <ConnectGoogleCalendar />
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
          <Route path="/register"  element={<Register headerHeight={headerHeight} />} />
          <Route path="/teams" element={user ? <TeamsPage /> : <Navigate to="/login" />} />
          <Route path="/dashboard/:teamId" element={<Dashboard />} />
          <Route path="/" element={user ? <Navigate to="/teams" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );

}

export default App;
