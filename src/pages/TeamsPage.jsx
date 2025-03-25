  import { useEffect, useState, useContext } from 'react';
  import { getTeams } from '../api/teams';
  import { useNavigate } from 'react-router-dom';
  import { Container, ListGroup, Button, Form, Row, Col } from 'react-bootstrap';
  import { UserContext } from '../context/UserContext';

  const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState('');
    const { user } = useContext(UserContext);
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
        const response = await fetch('https://taskmanager-server-ygfb.onrender.com/api/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: teamName })
        });

        const text = await response.text();
        if (!text) throw new Error("Empty response from server");

        const data = JSON.parse(text);

        if (response.ok) {
          setTeams(prev => [...prev, data.team]);
          setTeamName('');
        } else {
          alert(`🚨 שגיאה: ${data.message}`);
        }
      } catch (error) {
        console.error("❌ Error creating team:", error);
        alert("❌ שגיאה בחיבור לשרת");
      }
    };

    const deleteTeam = async (teamId) => {
      const confirmDelete = window.confirm("❗ האם אתה בטוח שברצונך למחוק את הצוות?");
      if (!confirmDelete) return;

      const token = localStorage.getItem('token');
      const res = await fetch(`https://taskmanager-server-ygfb.onrender.com/api/users/teams/${teamId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        alert('🗑 הצוות נמחק בהצלחה');
        setTeams(teams.filter(t => t._id !== teamId)); // ⬅️ עדכון ה־state
      } else {
        alert(`❌ שגיאה: ${data.message}`);
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
            <ListGroup.Item key={team._id} className="d-flex justify-content-between align-items-center">
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/${team._id}`)}
              >
                {team.name} 🏢 ({team.members?.length} חברים)
              </div>

              {team.createdBy === user?.id && (
                <Button variant="danger" size="sm" onClick={() => deleteTeam(team._id)}>
                  🗑 מחק
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    );
  };

  export default TeamsPage;
