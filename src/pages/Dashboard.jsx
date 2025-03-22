import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTasksByTeam, updateTaskStatus, deleteTask, getUsers, getTeamById } from '../api/tasks';
import TaskForm from '../components/TaskForm';
import { Container, Row, Col, ListGroup, Badge, Button, Modal, Nav , Form } from 'react-bootstrap';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
    const { teamId } = useParams();
    const { user } = useUser();
    const [team, setTeam] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState('today');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');

    const userId = user?._id || user?.id;

    useEffect(() => {
        if (teamId) {
            fetchTeamDetails();
            fetchTasks();
            fetchUsers();
        }
    }, [teamId, userId]);

    const fetchTeamDetails = async () => {
        try {
            const teamData = await getTeamById(teamId);
            setTeam(teamData);
        } catch (error) {
            console.error("❌ שגיאה בקבלת פרטי הצוות:", error);
        }
    };

    const fetchTasks = async () => {
        if (!teamId) return;
        try {
            const data = await getTasksByTeam(teamId);
            setTasks(data);
        } catch (error) {
            console.error('❌ שגיאה בשליפת משימות:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            const usersMap = data.reduce((map, user) => {
                map[user._id] = user.name;
                return map;
            }, {});
            setUsers(usersMap);
        } catch (error) {
            console.error('❌ שגיאה בשליפת משתמשים:', error);
        }
    };

    const handleCompleteTask = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        await updateTaskStatus(taskId, newStatus);
        fetchTasks();
    };

    const handleShowTaskDetails = (task) => {
        setSelectedTask(task);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleDeleteTask = async (taskId) => {
        const confirmDelete = window.confirm("❌ האם אתה בטוח שברצונך למחוק את המשימה?");
        if (confirmDelete) {
            await deleteTask(taskId);
            fetchTasks();
        }
    };

    const filterTasks = () => {
        const today = new Date().toISOString().split('T')[0];
        return tasks.filter(task => {
            const due = task.dueDate?.split('T')[0];
            if (selectedTab === 'today') return due === today && task.status !== 'completed';
            if (selectedTab === 'upcoming') return due > today && task.status !== 'completed';
            if (selectedTab === 'completed') return task.status === 'completed';
            return true;
        });
    };

    const handleSendInvite = async () => {
        if (!inviteEmail.trim()) return setInviteMessage('🛑 נא להזין כתובת מייל');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://taskmanager-client-2pyw.onrender.com/api/users/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email: inviteEmail, teamId })
            });

            const data = await res.json();
            if (res.ok) {
                setInviteMessage('✅ ההזמנה נשלחה בהצלחה!');
                setInviteEmail('');
            } else {
                setInviteMessage(`❌ שגיאה: ${data.message}`);
            }
        } catch (err) {
            console.error('❌ שגיאה בשליחת ההזמנה:', err);
            setInviteMessage('❌ שגיאה בשליחת ההזמנה');
        }
    };

    return (
        <Container className="containerDashboard mt-4">
            <h1 className="text-center">📋 ניהול משימות - {team?.name || 'טוען...'}</h1>

            <Nav variant="tabs" className="mb-3 justify-content-center">
                {['today', 'upcoming', 'completed', 'all'].map(tab => (
                    <Nav.Item key={tab}>
                        <Nav.Link active={selectedTab === tab} onClick={() => setSelectedTab(tab)}>
                            {tab === 'today' ? '⏳ משימות להיום' : tab === 'upcoming' ? '📅 קרובות' : tab === 'completed' ? '✅ בוצעו' : '📋 כל המשימות'}
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            <Row className="justify-content-center mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>הזמן חבר לצוות לפי מייל 📧</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="הזן כתובת מייל"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button variant="success" className="mt-2" onClick={handleSendInvite}>
                            ✉️ שלח הזמנה
                        </Button>
                        {inviteMessage && <p className="mt-2">{inviteMessage}</p>}
                    </Form.Group>
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col md={8}>
                    <Button variant="primary" className="mb-3 w-100" onClick={() => setShowTaskForm(true)}>
                        ➕ הוסף משימה
                    </Button>

                    {showTaskForm && (
                        <Modal show={showTaskForm} onHide={() => setShowTaskForm(false)} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>➕ הוסף משימה חדשה</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <TaskForm teamId={teamId} onTaskAdded={() => { fetchTasks(); setShowTaskForm(false); }} />
                            </Modal.Body>
                        </Modal>
                    )}

                    <ListGroup className="mt-2">
                        {filterTasks().map(task => (
                            <ListGroup.Item key={task._id} className="d-flex justify-content-between align-items-center">
                                <div style={{ flexGrow: 1 }}>
                                    <span onClick={() => handleShowTaskDetails(task)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                        {task.title}
                                    </span>
                                    <small className="text-muted">📝 {users[task.createdBy] || "לא ידוע"}</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <Badge bg={task.status === 'completed' ? 'success' : 'warning'} className="me-2">
                                        {task.status === 'completed' ? '✅ בוצע' : '⏳ בהמתנה'}
                                    </Badge>
                                    <Button
                                        variant={task.status === 'completed' ? "outline-warning" : "outline-success"}
                                        size="sm"
                                        className="ms-2"
                                        onClick={() => handleCompleteTask(task._id, task.status)}
                                    >
                                        {task.status === 'completed' ? "↩️ החזר" : "✔️ סמן"}
                                    </Button>
                                    {task.status === 'completed' && (
                                        <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDeleteTask(task._id)}>
                                            🗑
                                        </Button>
                                    )}
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
            </Row>

            {selectedTask && (
                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>📝 פרטי המשימה</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>{selectedTask.title}</h4>
                        <p>{selectedTask.description}</p>
                        <p><strong>תאריך יעד:</strong> {selectedTask.dueDate}</p>
                        <p><strong>יוצר:</strong> {users[selectedTask.createdBy] || "לא ידוע"}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>סגור</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
};

export default Dashboard;
