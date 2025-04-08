import { useEffect, useState, useMemo, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTasksByTeam, updateTaskStatus, deleteTask, getTeamMembers, getTeamById, createTaskForTeam, updateTask } from '../../api/tasks';
import TaskForm from '../../components/TaskForm/TaskForm';
import styles from "./Dashboard.module.css";
import { UserContext } from '../../context/UserContext';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';



const Dashboard = () => {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState({});
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('viewMode') || 'list';
    });
    const [selectedTask, setSelectedTask] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState('today');
    const [searchTerm, setSearchTerm] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [taskToEdit, setTaskToEdit] = useState(null);
    const { darkMode, user, setUser } = useContext(UserContext);
    const userId = user?._id || user?.id;
    const [hideHeader, setHideHeader] = useState(false);
    const [animatingTab, setAnimatingTab] = useState(false);
    const lastScrollY = useRef(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const API_URL = 'https://taskmanager-server-ygfb.onrender.com';
    //const API_URL = 'http://localhost:5000';

    useEffect(() => {
        localStorage.setItem('viewMode', viewMode);
    }, [viewMode]);


    useEffect(() => {
        setAnimatingTab(true);
        const timer = setTimeout(() => setAnimatingTab(false), 300);
        return () => clearTimeout(timer);
    }, [selectedTab]);

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
        if (!teamId || !userId) return;

        const loadData = async () => {
            await fetchTeamDetails();
            await fetchTasks();
            await fetchUsers();
        };

        loadData();
    }, [teamId, userId]);

    const fetchTeamDetails = async () => {
        try {
            const teamData = await getTeamById(teamId);
            setTeam(teamData);

            const foundMember = teamData?.members?.find(m =>
                m?.userId === userId || m?.userId?._id === userId
            );

            if (foundMember?.role === 'admin') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("❌ שגיאה בקבלת פרטי הצוות:", error);
        }
    };


    const fetchTasks = async () => {
        if (!teamId) return;
        setLoading(true);
        try {
            const data = await getTasksByTeam(teamId);
            setTasks(data);
        } catch (error) {
            console.error('❌ שגיאה בשליפת משימות:', error);
        } finally {
            setLoading(false); // ← סיים טעינה
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await getTeamMembers(teamId);
            const usersMap = (data || []).reduce((map, member) => {
                const user = member?.userId;
                if (user && user._id) {
                    map[user._id] = user.name;
                }
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
            toast.success("↩️ המשימה הוחזרה למצב המתנה");
        } else {
            await updateTaskStatus(taskId, 'completed');
            toast.success("✔️ המשימה סומנה כבוצעה");
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
            try {
                await deleteTask(taskId);
                toast.success("🗑️ המשימה נמחקה בהצלחה");
                fetchTasks();
            } catch (error) {
                toast.error("⚠️ שגיאה במחיקת המשימה");
            }
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

        return tasks.filter(task => {
            const titleMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const dueDate = task.dueDate ? task.dueDate.split('T')[0] : null;

            const statusMatch =
                selectedTab === 'all' ||
                (selectedTab === 'today' && dueDate === today && task.status !== 'completed') ||
                (selectedTab === 'upcoming' && dueDate > today && task.status !== 'completed') ||
                (selectedTab === 'completed' && task.status === 'completed');

            return titleMatch && statusMatch;
        });
    }, [tasks, selectedTab, searchTerm]);

  

    const handleSendInvite = async () => {
        if (!inviteEmail.trim()) {
            toast.error('🛑 נא להזין כתובת מייל');
            return;
        }
    
        const storedTeam = localStorage.getItem('teamId');
        const finalTeamId = teamId || storedTeam;
    
        if (!finalTeamId) {
            toast.error('❌ לא נמצא teamId, יש לוודא שאתה נמצא בצוות');
            return;
        }
    
        try {
            const res = await fetch(`${API_URL}/api/users/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: inviteEmail, teamId: finalTeamId })
            });
    
            const data = await res.json();
    
            if (res.ok) {
                toast.success('✅ ההזמנה נשלחה בהצלחה!');
                setInviteEmail('');
            } else {
                toast.error(`❌ שגיאה: ${data.message}`);
            }
        } catch (err) {
            console.error('❌ שגיאה בשליחת ההזמנה:', err);
            toast.error('❌ שגיאה כללית בשליחת ההזמנה');
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
        <div className={`${styles.dashboardContainer} ${darkMode ? styles.dark : ''}`}>

            <div className={styles.headerSticky}>
                <h1 className={styles.title}>
                    {team ? `📋 ניהול משימות - ${team.name}` : '📋 טוען ...'}
                </h1>
            </div>

            <p>המשתמש שלך הוא: {isAdmin ? '🧑‍💼 מנהל' : '👤 חבר צוות'}</p>

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

                {isAdmin && (
                    <div className={styles.inviteSection}>
                        <label>📧 הזמן חבר לצוות לפי מייל</label>
                        <input
                            type="email"
                            placeholder="הזן כתובת מייל"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <button className={styles.inviteButton} onClick={handleSendInvite}>
                            ✉️ שלח הזמנה
                        </button>
                        {inviteMessage && <p className={styles.inviteMessage}>{inviteMessage}</p>}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '1rem' }}>
                <input
                    type="text"
                    placeholder="🔍 חפש משימה לפי שם..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={`${styles.taskList} ${hideHeader ? styles.withoutHeader : ''} ${animatingTab ? styles.entering : ''}`}>

                {isAdmin && (
                    <button className={styles.addTaskButton} onClick={() => setShowTaskForm(true)}>
                        ➕
                    </button>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        className={styles.viewToggle}
                        onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
                    >
                        {viewMode === 'list' ? '🔳 מעבר לטבלה' : '📋 מעבר לרשימה'}
                    </button>
                </div>

                {/* תצוגת משימות */}

                {loading ? (
                    <div className={styles.spinnerWrapper}>
                        <div className={styles.spinner}></div>
                        <p>טוען משימות...</p>
                    </div>

                ) : filteredTasks.length === 0 ? (
                    <p className={styles.noTasks}>📭 אין משימות להצגה</p>
                ) : viewMode === 'list' ? (
                    <ul className={styles.taskItems}>
                        {filteredTasks.map(task => {
                            const isCreator = task.createdBy === userId;
                            const isAssigned = task.assignedTo === userId;
                            const creatorName = users[task.createdBy] || "לא ידוע";

                            return (
                                <li key={task._id} className={styles.taskItem}>
                                    <div className={styles.taskDetails} onClick={() => handleShowTaskDetails(task)}>
                                        <span className={`${styles.taskTitle} ${isCreator ? styles.taskTitle : isAssigned ? styles.assigned : styles.taskTitle}`}>
                                            {task.title}
                                        </span>
                                        <small className={styles.creatorInfo}>📝 {creatorName} - יוצר המשימה</small>
                                    </div>

                                    <div className={styles.taskActions}>
                                        <span className={`${styles.statusBadge} ${task.status}`}>
                                            {task.status === 'completed' ? '✅ בוצע' : '⏳ בהמתנה'}
                                        </span>

                                        <button className={styles.actionBtn} onClick={() => handleCompleteTask(task._id, task.status)}>
                                            {task.status === 'completed' ? "↩️ החזר למשימה" : "✔️ סמן כבוצע"}
                                        </button>

                                        {task.status === 'completed' && isAdmin && (
                                            <button className={styles.deleteBtn} onClick={() => handleDeleteTask(task._id)}>
                                                🗑
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className={styles.kanbanBoard}>
                        {/* בעתיד ניתן להוסיף כאן טור נוסף לסטטוס 'inProgress' אם נחליט לתמוך בזה */}
                        {['pending', 'completed'].map(status => (
                            <div key={status} className={styles.kanbanColumn}>
                                <h3>
                                    {status === 'pending' ? '⏳ בהמתנה' :
                                        status === 'inProgress' ? '🚧 בתהליך' : '✅ בוצע'}
                                </h3>

                                {filteredTasks
                                    .filter(task => task.status === status)
                                    .map((task, i) => {
                                        const isCreator = task.createdBy === userId;
                                        const isAssigned = task.assignedTo === userId;
                                        const creatorName = users[task.createdBy] || "לא ידוע";

                                        return (
                                            <div
                                                key={task._id}
                                                className={styles.taskItem}
                                                onClick={() => handleShowTaskDetails(task)}
                                                style={{ animationDelay: `${i * 50}ms` }} // stagger עדין בין כרטיסים
                                            >
                                                <span className={`${styles.taskTitle} ${isCreator ? styles.taskTitle : isAssigned ? styles.assigned : styles.taskTitle}`}>
                                                    {task.title}
                                                </span>
                                                <small className={styles.creatorInfo}>📝 {creatorName} - יוצר המשימה</small>

                                                <div className={styles.taskActions}>
                                                    <span className={`${styles.statusBadge} ${task.status}`}>
                                                        {task.status === 'completed' ? '✅ בוצע' : '⏳ בהמתנה'}
                                                    </span>

                                                    <button className={styles.actionBtn} onClick={() => handleCompleteTask(task._id, task.status)}>
                                                        {task.status === 'completed' ? "↩️ החזר למשימה" : "✔️ סמן כבוצע"}
                                                    </button>

                                                    {task.status === 'completed' && isAdmin && (
                                                        <button className={styles.deleteBtn} onClick={() => handleDeleteTask(task._id)}>
                                                            🗑
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* טופס יצירת / עריכת משימה */}
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
                                toast.success("✔️ משימה חדשה נוספה");
                                setShowTaskForm(false);
                            }}
                            onEditComplete={() => {
                                fetchTasks();
                                toast.success("✏️ המשימה עודכנה בהצלחה");
                                setShowTaskForm(false);
                                setTaskToEdit(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* מודל פרטי משימה */}
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
                        {isAdmin && (
                            <button className={styles.editTask} onClick={() => handleEditTask(selectedTask)}>
                                ✏ ערוך משימה
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
