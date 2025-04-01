import { useEffect, useState, useMemo, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTasksByTeam, updateTaskStatus, deleteTask, getTeamMembers, getTeamById, createTaskForTeam, updateTask } from '../../api/tasks';
import TaskForm from '../../components/TaskForm/TaskForm';
import styles from "./Dashboard.module.css";
import { UserContext } from '../../context/UserContext';

const Dashboard = () => {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState({});
    const [user, setUser] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState('today');
    const [userId, setUserId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [taskToEdit, setTaskToEdit] = useState(null);
    const { darkMode } = useContext(UserContext);
    const [hideHeader, setHideHeader] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
                setHideHeader(true); 
            } else {
                setHideHeader(false); 
            }
            lastScrollY.current = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setUserId(userData.id || userData._id);
        } else {
            console.warn("🚨 אין משתמש מחובר ב-LocalStorage!");
        }
    }, []);

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
            const data = await getTeamMembers(teamId);
            const usersMap = data.reduce((map, user) => {
                map[user._id] = user.name;
                return map;
            }, {});
            setUsers(usersMap);
        } catch (error) {
            console.error('❌ שגיאה בשליפת חברי הצוות:', error);
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

    const handleEditTask = (task) => {
        setTaskToEdit(task);
        setShowTaskForm(true);
        handleCloseModal();
        setSelectedTask(null);
    };

    const filteredTasks = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        if (!userId || !teamId) return [];

        return tasks.filter(task => {
            const taskDueDate = task.dueDate ? task.dueDate.split('T')[0] : null;

            if (selectedTab === 'all') return true;
            if (selectedTab === 'today') return taskDueDate === today && task.status !== 'completed';
            if (selectedTab === 'upcoming') return taskDueDate > today && task.status !== 'completed';
            if (selectedTab === 'completed') return task.status === 'completed';
        });
    }, [tasks, selectedTab, teamId, userId]);

    const handleSendInvite = async () => {
        if (!inviteEmail.trim()) {
            setInviteMessage('🛑 נא להזין כתובת מייל');
            return;
        }

        const storedTeam = localStorage.getItem('teamId');
        const finalTeamId = teamId || storedTeam;

        if (!finalTeamId) {
            setInviteMessage('❌ לא נמצא teamId, יש לוודא שאתה נמצא בצוות');
            return;
        }

        try {
            const res = await fetch('https://taskmanager-server-ygfb.onrender.com/api/users/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // ✅ שולח את ה-cookie עם ה־JWT
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

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`${styles.dashboardContainer} ${darkMode ? styles.dark : ''} `} >
            <div className={styles.headerSticky}>
                <h1 className={styles.title}>
                    {team ? `📋 ניהול משימות - ${team.name}` : '📋 טוען ...'}
                </h1>
            </div>

            <div className={`${styles.selectTamp} ${hideHeader ? styles.hidden : ''}`}>
                <div className={styles.filterButtons}>
                    {['today', 'upcoming', 'completed', 'all'].map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tabButton} ${selectedTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setSelectedTab(tab)}
                        >
                            {tab === 'today' ? '⏳ להיום' :
                                tab === 'upcoming' ? '📅 קרובות' :
                                    tab === 'completed' ? '✅ שבוצעו' : '📋 כל המשימות'}
                        </button>
                    ))}
                </div>

                <div className={styles.inviteSection}>
                    <label>📧 הזמן חבר לצוות לפי מייל</label>
                    <input
                        type="email"
                        placeholder="הזן כתובת מייל"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <button className={styles.inviteButton} onClick={handleSendInvite}>✉️ שלח הזמנה</button>
                    {inviteMessage && <p className={styles.inviteMessage}>{inviteMessage}</p>}
                </div>
            </div>


            <div className={`${styles.taskList} ${hideHeader ? styles.withoutHeader : ''}`}>
                {team && (
                    <button className={styles.addTaskButton} onClick={() => setShowTaskForm(true)}>
                        ➕
                    </button>
                )}
                {showTaskForm && (
                    <div className={styles.modalWrapper}>
                        <div className={styles.modalContent}>
                            <button className={styles.closeModal} onClick={() => {
                                setShowTaskForm(false);
                                setTaskToEdit(null);
                            }}>X</button>
                            <TaskForm
                                teamId={teamId}
                                taskToEdit={taskToEdit}
                                isDarkMode={darkMode}
                                users={Object.entries(users).map(([id, name]) => ({ _id: id, name }))}
                                onTaskAdded={() => {
                                    fetchTasks();
                                    setShowTaskForm(false);
                                }}
                                onEditComplete={() => {
                                    fetchTasks();
                                    setShowTaskForm(false);
                                    setTaskToEdit(null);
                                }}
                            />

                        </div>
                    </div>
                )}

                <ul className={styles.taskItems}>
                    {filteredTasks.map(task => {
                        const isCreator = task.createdBy === userId;
                        const isAssigned = task.assignedTo === userId;
                        const creatorName = users[task.createdBy] || "לא ידוע";

                        return (
                            <li key={task._id} className={styles.taskItem}>
                                <div className={styles.taskDetails} onClick={() => handleShowTaskDetails(task)}>
                                    <span className={`${styles.taskTitle} ${isCreator ? `${styles.taskTitle}` : isAssigned ? `${styles.assigned}` : `${styles.taskTitle}`}`}>
                                        {task.title}
                                    </span>
                                    <small className={styles.creatorInfo}>📝 {creatorName} - יוצר המשימה</small>
                                </div>

                                <div className={styles.taskActions}>
                                    <span className={`${styles.statusBadge} ${task.status}`}>
                                        {task.status === 'completed' ? '✅ בוצע' : '⏳ בהמתנה'}
                                    </span>

                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleCompleteTask(task._id, task.status)}
                                    >
                                        {task.status === 'completed' ? "↩️ החזר למשימה" : "✔️ סמן כבוצע"}
                                    </button>

                                    {task.status === 'completed' && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteTask(task._id)}
                                        >
                                            🗑
                                        </button>
                                    )}
                                </div>

                            </li>
                        );
                    })}
                </ul>
            </div>

            {selectedTask && (
                <div className={styles.modalWrapper}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeModal} onClick={handleCloseModal}>✖</button>

                        <h3>📝 פרטי המשימה</h3>
                        <p className={styles.title}><strong>{selectedTask.title}</strong></p>
                        <p>{selectedTask.description}</p>
                        <p><span className={styles.label}>📅 תאריך יעד:</span> {formatDate(selectedTask.dueDate)}</p>
                        <p><span className={styles.label}>👤 יוצר:</span> {users[selectedTask.createdBy] || "לא ידוע"}</p>
                        <p><span className={styles.label}>🎯 הוקצתה ל:</span> {users[selectedTask.assignedTo] || "לא ידוע"}</p>

                        <button className={styles.editTask} onClick={() => handleEditTask(selectedTask)}>
                            ✏ ערוך משימה
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
