import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTasksByTeam, updateTaskStatus, deleteTask, getUsers, getTeamById, createTaskForTeam } from '../api/tasks';
import TaskForm from '../components/TaskForm';
import { Container, Row, Col, ListGroup, Badge, Button, Modal, Nav , Form } from 'react-bootstrap';


const Dashboard = () => {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState('today');
    const [userId, setUserId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');



    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUserId(userData.id || userData._id); // תומך גם ב-id וגם ב-_id
        } else {
            console.warn("🚨 אין משתמש מחובר ב-LocalStorage!");
        }
    }, []);


    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                const teamData = await getTeamById(teamId);
                setTeam(teamData);
            } catch (error) {
                console.error("❌ שגיאה בקבלת פרטי הצוות:", error);
            }
        };

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
            console.log("📌 משימות מהשרת:", data); // ✅ בדוק אם המשימות באמת מתקבלות
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
        if (currentStatus === 'completed') {
            const confirm = window.confirm("❓ המשימה סומנה כבוצעה. האם להחזיר למצב המתנה?");
            if (!confirm) return;

            await updateTaskStatus(taskId, 'pending');
        } else {
            await updateTaskStatus(taskId, 'completed');
        }

        fetchTasks(); // רענון המשימות לאחר שינוי
    };


    const handleShowTaskDetails = (task) => {
        setSelectedTask(task);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setSelectedTask(null);
        setShowModal(false);
    };

    const handleDeleteTask = async (taskId) => {
        const confirmDelete = window.confirm("❌ האם אתה בטוח שברצונך למחוק את המשימה?");
        if (confirmDelete) {
            await deleteTask(taskId);
            fetchTasks();
        }
    };

    const filterTasks = () => {
        const today = new Date().toISOString().split('T')[0];

        if (!userId || !teamId) return [];

        return tasks.filter(task => {
            const taskDueDate = task.dueDate ? task.dueDate.split('T')[0] : null;

            if (selectedTab === 'all') return true;
            if (selectedTab === 'today') return taskDueDate === today && task.status !== 'completed';
            if (selectedTab === 'upcoming') return taskDueDate > today && task.status !== 'completed';
            if (selectedTab === 'completed') return task.status === 'completed';
        });
    };

    const handleSendInvite = async () => {
        if (!inviteEmail.trim()) {
            setInviteMessage('🛑 נא להזין כתובת מייל');
            return;
        }
    
        // שליפת teamId מהנתונים הקיימים
        const { teamId } = useParams(); 
        const storedTeam = localStorage.getItem('teamId'); 
        const finalTeamId = teamId || storedTeam;
    
        if (!finalTeamId) {
            setInviteMessage('❌ לא נמצא teamId, יש לוודא שאתה נמצא בצוות');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://taskmanager-client-2pyw.onrender.com/api/users/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email: inviteEmail, teamId: finalTeamId }) 
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
            {team ? (
                <h1 className="text-center">📋 ניהול משימות -  {team.name}</h1>
            ) : (
                <h1 className="text-center">📋 טוען ...</h1>
            )}

            

            <Nav variant="tabs" className="mb-3 justify-content-center">
                {['today', 'upcoming', 'completed', 'all'].map(tab => (
                    <Nav.Item key={tab}>
                        <Nav.Link
                            active={selectedTab === tab}
                            onClick={() => setSelectedTab(tab)}
                            className="text-center"
                        >
                            {tab === 'today' ? '⏳ משימות להיום' :
                                tab === 'upcoming' ? '📅 משימות קרובות' :
                                    tab === 'completed' ? '✅ משימות שבוצעו' :
                                        '📋 כל המשימות'}
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
                    {team && (
                        <Button
                            variant="primary"
                            className="mb-3 w-100"
                            onClick={() => setShowTaskForm(true)}
                        >
                            ➕ הוסף משימה
                        </Button>
                    )}

                    {showTaskForm && (
                        <Modal show={showTaskForm} onHide={() => setShowTaskForm(false)} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>➕ הוסף משימה חדשה</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <TaskForm
                                    teamId={teamId} // ✅ שולח את teamId
                                    onTaskAdded={() => {
                                        fetchTasks();
                                        setShowTaskForm(false);
                                    }}
                                />
                            </Modal.Body>
                        </Modal>
                    )}

                    <ListGroup className="mt-2">
                        {filterTasks().map(task => {
                            const isCreator = task.createdBy === userId;
                            const isAssigned = task.assignedTo === userId;
                            const creatorName = users[task.createdBy] || "לא ידוע";

                            return (
                                <ListGroup.Item
                                    key={task._id}
                                    className="d-flex justify-content-between align-items-center"
                                    style={{ padding: "12px", borderRadius: "8px" }}
                                >
                                    <div className="d-flex flex-column" style={{ flexGrow: 1 }}>
                                        <span
                                            onClick={() => handleShowTaskDetails(task)}
                                            style={{
                                                cursor: 'pointer',
                                                color: isCreator ? 'blue' : isAssigned ? 'green' : 'black',
                                                fontWeight: "bold"
                                            }}
                                        >
                                            {task.title}
                                        </span>
                                        <small className="text-muted">
                                            📝 {creatorName} - יוצר המשימה
                                        </small>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <Badge
                                            bg={task.status === 'completed' ? 'success' : 'warning'}
                                            className="me-2"
                                            style={{ fontSize: "0.85rem", padding: "6px 8px" }}
                                        >
                                            {task.status === 'completed' ? '✅ בוצע' : '⏳ בהמתנה'}
                                        </Badge>

                                        <Button
                                            variant={task.status === 'completed' ? "outline-warning" : "outline-success"}
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => handleCompleteTask(task._id, task.status)}
                                        >
                                            {task.status === 'completed' ? "↩️ החזר למשימה" : "✔️ סמן כבוצע"}
                                        </Button>

                                        {task.status === 'completed' && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="ms-2"
                                                onClick={() => handleDeleteTask(task._id)}
                                            >
                                                🗑
                                            </Button>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            );
                        })}
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
                        <Button variant="secondary" onClick={handleCloseModal}>
                            סגור
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

        </Container>
    );
};

export default Dashboard;
