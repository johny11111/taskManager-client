import { useState, useEffect } from 'react';
import { registerUser } from '../api/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromLink = params.get('token');
        if (tokenFromLink) setToken(tokenFromLink);
    }, [location]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const data = await registerUser({ name, email, password, token });

        if (data.message === 'User registered successfully') {
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000); // מפנה לדף הראשי
        } else {
            setError(data.message || 'Registration failed');
        }
    };

    return (
        <Container className="containerRegister">
            <Card className="card p-4 shadow-lg form-container">
                <h2 className="text-center">הרשמה</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">✅ הרשמה הצליחה! מעביר לדף הראשי...</Alert>}
                <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                        <Form.Label>שם מלא</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>אימייל</Form.Label>
                        <Form.Control 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>סיסמה</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">הירשם</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default Register;
