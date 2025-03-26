import { useState } from 'react';
import { loginUser } from '../../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';

const Login = ({ setUser , headerHeight }) => {
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
        localStorage.setItem('user', JSON.stringify(data.user)); // אין יותר token
        setUser(data.user);
        navigate('/teams');
      } else {
        setError(data.message || 'Login failed');
      }

    } catch (err) {
      setError('Error connecting to server');
    }
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
