import { useState } from 'react';
import { loginUser } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import '../index.css';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await loginUser({ email, password });

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user)); // אין יותר token
                setUser(data.user);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }

        } catch (err) {
            setError('Error connecting to server');
        }
    };

    return (
        <Container className="containerLogin">
            <Card className="card p-4 shadow-lg form-container">
                <h2 className="text-center"> התחברות</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                        <Form.Label>אימייל</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-dark-mode"
                            autoComplete="username"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>סיסמה</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-dark-mode"
                            autoComplete="current-password"
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="btnLogin w-100"> התחבר/י</Button>
                </Form>
                <p className="mt-3 text-center">
                    אין לך חשבון? <Link to="/register" className="link-dark-mode">הרשמה</Link>
                </p>
            </Card>
        </Container>
    );
};

export default Login;
