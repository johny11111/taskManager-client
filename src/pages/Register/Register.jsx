import { useState, useEffect } from 'react';
import { registerUser } from '../../api/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from "./Register.module.css";

const Register = ({ headerHeight }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromLink = params.get('token');
    if (tokenFromLink) setToken(tokenFromLink);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = await registerUser({ name, email, password, token });

    if (data.message === 'User registered successfully') {
      setSuccess('✅ ההרשמה בוצעה בהצלחה! מעביר לדף ההתחברות...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(data.message || 'ההרשמה נכשלה');
    }
  };

  return (
    <div 
      className={styles.containerRegister} 
      style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
    >
      <div className={styles.card} dir="rtl">
        <h2 className={styles.title}>הרשמה</h2>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name" className={styles.label}>שם מלא</label>
          <input
            type="text"
            id="name"
            className={styles.inputField}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="email" className={styles.label}>אימייל</label>
          <input
            type="email"
            id="email"
            className={styles.inputField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <label htmlFor="password" className={styles.label}>סיסמה</label>
          <div className={styles.passwordField}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setShowPassword(prev => !prev)}
              aria-label="Show or hide password"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" className={styles.submitButton}>
            הרשמה
          </button>
        </form>

        <p className={styles.switchPage}>
          כבר יש לך חשבון? <Link to="/login">התחברות</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
