// 📁 App.jsx
import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamsPage from './pages/TeamsPage';
import Dashboard from './pages/Dashboard';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { UserContext } from './context/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import ConnectGoogleCalendar from './components/ConnectGoogleCalendar';

import { logoutUser } from './api/auth';


function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'enabled');

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
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
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
          <Route path="/dashboard" element={selectedTeam ? <Dashboard team={selectedTeam} /> : <Navigate to="/teams" />} />
          <Route path="/dashboard/:teamId" element={<Dashboard />} />
          <Route path="/google/callback" element={<ConnectGoogleCalendar />} />
          <Route path="/" element={user ? <Navigate to="/teams" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
