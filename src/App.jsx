import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamsPage from './pages/TeamsPage'; 
import Dashboard from './pages/Dashboard';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'enabled');

  useEffect(() => {
    setToken(localStorage.getItem('token'))
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedTeam(null);
    
  };

  return (
    <Router>
      <Navbar expand="lg" className={`navbar-custom ${darkMode ? 'navbar-dark' : 'navbar-light'}`}>
        <Container>
          <Navbar.Brand className='navbarBrand' as={Link} to="/">Task Manager</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
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

                  <Button variant={darkMode ? "outline-light" : "outline-dark"} className="w-100 my-2" onClick={handleLogout}>
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
        <Route path="/teams" element={user ? <TeamsPage setSelectedTeam={setSelectedTeam} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={selectedTeam ? <Dashboard team={selectedTeam} /> : <Navigate to="/teams" />} />
        <Route path="/dashboard/:teamId" element={ <Dashboard />} />
        <Route path="/" element={user ? <Navigate to="/teams" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
