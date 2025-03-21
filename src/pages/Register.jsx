import { useState } from 'react';
import { registerUser } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert , Card  } from 'react-bootstrap';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const data = await registerUser({ name, email, password });

        if (data.message === 'User registered successfully') {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000); // מעבר לדף התחברות אחרי הצלחה
        } else {
            setError(data.message || 'Registration failed');
        }
    };

    return (
        <Container className="containerRegister">
        <Card className="card p-4 shadow-lg form-container">
            <h2 className="text-center">הרשמה</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">✅ הרשמה הצליחה! מעביר לדף התחברות...</Alert>}
            <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                    <Form.Label>שם מלא</Form.Label>
                    <Form.Control 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        className="input-dark-mode"
                    />
                </Form.Group>
    
                <Form.Group className="mb-3">
                    <Form.Label>אימייל</Form.Label>
                    <Form.Control 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="input-dark-mode"
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
                    />
                </Form.Group>
    
                <Button variant="primary" type="submit" className="btnRegister w-100">הירשם</Button>
            </Form>
            <p className="mt-3 text-center">
                כבר יש לך חשבון? <Link to="/login" className="link-dark-mode">להתחברות</Link>
            </p>
        </Card>
    </Container>
    
    );
};

export default Register;
