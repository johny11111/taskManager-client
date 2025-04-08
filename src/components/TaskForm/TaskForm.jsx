import { useState, useEffect } from 'react';
import { createTaskForTeam, getTeamMembers, updateTask } from '../../api/tasks';
import styles from "./TaskForm.module.css";

const TaskForm = ({ teamId, onTaskAdded, taskToEdit, onEditComplete, isDarkMode }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState([]);

  const [taskType, setTaskType] = useState('task'); // או 'meeting'
  const [duration, setDuration] = useState(30); // בדקות
  const [recurrence, setRecurrence] = useState('none'); // daily, weekly, monthly
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  useEffect(() => {
    if (teamId) fetchUsers();
  }, [teamId]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setAssignedTo(taskToEdit.assignedTo);
      setDueDate(new Date(taskToEdit.dueDate).toISOString().slice(0, 16));
      setTaskType(taskToEdit.type || 'task');
      setDuration(taskToEdit.duration || 30);
      setRecurrence(taskToEdit.recurrence || 'none');
      setRecurrenceEndDate(taskToEdit.recurrenceEndDate || '');
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

    const payload = {
      title,
      description,
      assignedTo,
      dueDate: dueDateISO,
      type: taskType,
      ...(taskType === 'meeting' && {
        duration,
        recurrence,
        recurrenceEndDate: recurrenceEndDate || null
      })
    };

    try {
      if (taskToEdit) {
        await updateTask(taskToEdit._id, payload);
        onEditComplete?.();
      } else {
        await createTaskForTeam(teamId, payload);
        onTaskAdded?.();
      }

      // ניקוי הטופס
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      setTaskType('task');
      setDuration(30);
      setRecurrence('none');
      setRecurrenceEndDate('');
    } catch (error) {
      console.error("❌ שגיאה בשמירת המשימה:", error);
      alert("שגיאה בשמירה");
    }
  };

  return (
    <form
      className={`${styles.taskForm} ${isDarkMode ? styles.darkForm : ''}`}
      onSubmit={handleSubmit}
    >
      <h2 className={styles.formTitle}>
        {taskToEdit ? '✏️ עדכון משימה' : '📝 משימה חדשה'}
      </h2>

      <div className={styles.formGroup}>
        <label>סוג</label>
        <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
          <option value="task">📝 משימה</option>
          <option value="meeting">📅 פגישה</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>כותרת המשימה</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>תיאור</label>
        <textarea
          rows="2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {!taskToEdit && (
        <div className={styles.formGroup}>
          <label>הקצה למשתמש</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          >
            <option value="">בחר משתמש</option>
            <option value="all">👥 כל המשתמשים</option>
            {users.map(user => (
              <option key={user.userId?._id} value={user.userId._id}>
                {user.userId.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.formGroup}>
        <label>תאריך יעד (כולל שעה)</label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      {taskType === 'meeting' && (
        <>
          <div className={styles.formGroup}>
            <label>⏱ משך (בדקות)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>🔁 חזרתיות</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">ללא חזרתיות</option>
              <option value="daily">כל יום</option>
              <option value="weekly">כל שבוע</option>
              <option value="monthly">כל חודש</option>
            </select>
          </div>

          {recurrence !== 'none' && (
            <div className={styles.formGroup}>
              <label>📆 תאריך סיום חזרתיות</label>
              <input
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
              />
            </div>
          )}
        </>
      )}

      <button type="submit" className={styles.submitButton}>
        {taskToEdit ? '💾 עדכן משימה' : '➕ הוסף משימה'}
      </button>
    </form>
  );
};

export default TaskForm;
