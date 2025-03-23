import { useState, useEffect } from 'react';
import { createTaskForTeam, getTeamMembers } from '../api/tasks';
import { Form, Button, Container } from 'react-bootstrap';

const TaskForm = ({ teamId, onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (teamId) {
            fetchUsers();
        }
    }, [teamId]);

    const fetchUsers = async () => {
        try {
            const data = await getTeamMembers(teamId);
            setUsers(data);
        } catch (error) {
            console.error("❌ Error fetching users:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!title || !assignedTo || !teamId) {
            alert('אנא מלא את כל השדות החיוניים');
            return;
        }
    
        console.log("📤 שולח משימה לצוות:", teamId); // ✅ בדוק שה- ID נכון
    
        try {
            await createTaskForTeam(teamId, { title, description, assignedTo, dueDate });
            onTaskAdded(); // ✅ ריענון המשימות אחרי ההוספה
        } catch (error) {
            console.error("❌ Error creating task:", error);
            alert("שגיאה בהוספת המשימה");
        }
    };
    

    return (
        <Container>
            <Form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm bg-light">
                <Form.Group className="mb-3">
                    <Form.Label>כותרת המשימה</Form.Label>
                    <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>תיאור</Form.Label>
                    <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>הקצה למשתמש:</Form.Label>
                    <Form.Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required>
                        <option value="">בחר משתמש</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>{user.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>תאריך יעד</Form.Label>
                    <Form.Control type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </Form.Group>

                <Button variant="primary" type="submit">➕ הוסף משימה</Button>
            </Form>
        </Container>
    );
};

export default TaskForm;
