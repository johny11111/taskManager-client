import { useState, useEffect } from 'react';
import { createTaskForTeam, getTeamMembers, updateTask } from '../api/tasks';
import { Form, Button, Container } from 'react-bootstrap';

const TaskForm = ({ teamId, onTaskAdded, taskToEdit, onEditComplete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (teamId) fetchUsers();
  }, [teamId]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setAssignedTo(taskToEdit.assignedTo);
      setDueDate(new Date(taskToEdit.dueDate).toISOString().slice(0, 16)); // עבור input datetime-local
    }
  }, [taskToEdit]);

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

    if (!title || !assignedTo || !teamId || !dueDate) {
      alert('אנא מלא את כל השדות החיוניים');
      return;
    }

    const parsed = new Date(dueDate);
    if (isNaN(parsed)) {
      alert("תאריך יעד לא תקין");
      return;
    }

    const dueDateISO = parsed.toISOString();

    try {
      if (taskToEdit) {
        // עדכון משימה קיימת
        await updateTask(taskToEdit._id, {
          title,
          description,
          assignedTo,
          dueDate: dueDateISO
        });
        onEditComplete?.(); // עדכון רשימת משימות או סגירת טופס
      } else {
        // יצירת משימה חדשה
        await createTaskForTeam(teamId, {
          title,
          description,
          assignedTo,
          dueDate: dueDateISO
        });
        onTaskAdded?.();
      }

      // ניקוי שדות
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
    } catch (error) {
      console.error("❌ שגיאה בשמירת המשימה:", error);
      alert("שגיאה בשמירה");
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm bg-light">
        <Form.Group className="mb-3">
          <Form.Label>כותרת המשימה</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>תיאור</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>הקצה למשתמש:</Form.Label>
          <Form.Select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          >
            <option value="">בחר משתמש</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>תאריך יעד (כולל שעה)</Form.Label>
          <Form.Control
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          {taskToEdit ? '💾 עדכן משימה' : '➕ הוסף משימה'}
        </Button>
      </Form>
    </Container>
  );
};

export default TaskForm;
