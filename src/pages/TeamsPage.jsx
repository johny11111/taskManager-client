import { useEffect, useState } from 'react';
import { getTeams, createTeam } from '../api/teams';
import { getUsers } from '../api/tasks';
import { useNavigate } from 'react-router-dom';
import { Container, ListGroup, Button, Form } from 'react-bootstrap';

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, [teams]);

    const fetchTeams = async () => {
        const data = await getTeams();
        setTeams(data);
    };

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault(); // מונע ריענון הדף
        if (!teamName.trim()) {
            alert("🛑 יש להזין שם לצוות!");
            return;
        }
    
        console.log("📌 שולח בקשת יצירת צוות:", { name: teamName, members: selectedUsers });
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://taskmanager-server-ygfb.onrender.com/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: teamName, members: selectedUsers })
            });
            
    
            const data = await response.json();
            console.log("✅ תגובת השרת:", data);
    
            if (response.ok) {
                setTeams([...teams, data]); // מעדכן את רשימת הצוותים ב-UI
                setTeamName(''); // מאפס את השם
                setSelectedUsers([]); // מאפס את המשתמשים שנבחרו
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
                    <Form.Control type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>בחר חברים לצוות</Form.Label>
                    <Form.Select multiple onChange={(e) => setSelectedUsers([...e.target.selectedOptions].map(o => o.value))} required>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>{user.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Button type="submit" variant="primary">➕ צור צוות</Button>
            </Form>

            <h3 className="mt-4">📋 הצוותים שלי</h3>
            <ListGroup>
                {teams.map(team => (
                    <ListGroup.Item key={team._id} onClick={() => navigate(`/dashboard/${team._id}`)} style={{ cursor: 'pointer' }}>
                        {team.name} 🏢 ({team.members?.length} חברים)
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default TeamsPage;
