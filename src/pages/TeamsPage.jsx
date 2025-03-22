import { useEffect, useState } from 'react';
import { getTeams } from '../api/teams';
import { useNavigate } from 'react-router-dom';
import { Container, ListGroup, Button, Form } from 'react-bootstrap';

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        const data = await getTeams();
        setTeams(data);
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!teamName.trim()) {
            alert("🛑 יש להזין שם לצוות!");
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
          const response = await fetch('https://taskmanager-server.onrender.com/api/users/create', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: teamName })
            });
    
            // ✅ בדיקה אם התגובה ריקה כדי למנוע שגיאה
            const text = await response.text();
            if (!text) {
                throw new Error("Empty response from server");
            }
    
            const data = JSON.parse(text);
    
            if (response.ok) {
                setTeams([...teams, data.team]);
                setTeamName('');
            } else {
                alert(`🚨 שגיאה: ${data.message}`);
            }
        } catch (error) {
            console.error("❌ Error creating team:", error);
            alert("❌ שגיאה בחיבור לשרת");
        }
    };
    

    return (
        <Container className="mt-4">
            <h1 className="text-center">🏢 ניהול צוותים</h1>

            <Form onSubmit={handleCreateTeam} className="mb-3">
                <Form.Group className="mb-2">
                    <Form.Label>שם הצוות</Form.Label>
                    <Form.Control
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button type="submit" variant="primary">➕ צור צוות</Button>
            </Form>

            <h3 className="mt-4">📋 הצוותים שלי</h3>
            <ListGroup>
                {teams.map(team => (
                    <ListGroup.Item
                        key={team._id}
                        onClick={() => navigate(`/dashboard/${team._id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        {team.name} 🏢 ({team.members?.length} חברים)
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default TeamsPage;
