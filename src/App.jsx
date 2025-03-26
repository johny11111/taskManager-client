// 📁 App.jsx
import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamsPage from './pages/TeamsPage';
import Dashboard from './pages/Dashboard';
import { Navbar, Nav, Container, Button, Spinner } from 'react-bootstrap';
import { UserContext } from './context/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { logoutUser, getMe } from './api/auth';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'enabled');
  const [loading, setLoading] = useState(true);

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
      // נסה להביא מהשרת (אם יש עוגייה)
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
      await logoutUser(); // מחיקת העוגייה בשרת
    } catch (err) {
      console.error('Logout failed:', err);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setSelectedTeam(null);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p className="mt-3">טוען משתמש...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser, token, selectedTeam, setSelectedTeam }}>
      <Router>
        <Navbar expand="lg" className={`navbar-custom ${darkMode ? 'navbar-dark' : 'navbar-light'}`}>
          <Container>
            <Navbar.Brand as={Link} to="/">Task Manager</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav className="ms-auto">
                {!user ? (
                  <>
                    <Nav.Link as={Link} to="/login">🔑 התחברות</Nav.Link>
                    <Nav.Link as={Link} to="/register">📝 הרשמה</Nav.Link>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" className="w-100 my-2" onClick={() => setDarkMode(!darkMode)}>
                      {darkMode ? '☀️ מצב בהיר' : '🌙 מצב כהה'}
                    </Button>
                    <Button variant={darkMode ? 'outline-light' : 'outline-dark'} className="w-100 my-2" onClick={handleLogout}>
                      🚪 התנתק
                    </Button>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teams" element={user ? <TeamsPage /> : <Navigate to="/login" />} />
  
          <Route path="/dashboard/:teamId" element={<Dashboard />} />
          <Route path="/" element={user ? <Navigate to="/teams" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
