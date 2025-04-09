import { useEffect, useState, useContext } from 'react';
import styles from './TeamAdminsManager.module.css';
import toast from 'react-hot-toast';
import { getTeamMembers } from '../../api/tasks';
import { UserContext } from '../../context/UserContext';

export default function TeamMembersTable({ teamId }) {
  const [members, setMembers] = useState([]);
  const { darkMode } = useContext(UserContext);

  useEffect(() => {
    if (!teamId) return;

    getTeamMembers(teamId)
      .then(setMembers)
      .catch(() => toast.error('שגיאה בטעינת חברי הצוות'));
  }, [teamId]);

  const handleRoleChange = async (email, role) => {
    try {
      const res = await fetch(
        `https://taskmanager-server-ygfb.onrender.com/api/users/teams/${teamId}/promote`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, role }),
        }
      );

      if (!res.ok) throw new Error();
      toast.success('עודכן בהצלחה');

      setMembers((prev) =>
        prev.map((m) =>
          m.userId?.email === email ? { ...m, role } : m
        )
      );
    } catch {
      toast.error('שגיאה בעדכון התפקיד');
    }
  };

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.darkWrapper : ''}`}>
      {/* Desktop table */}
      <div className={styles.tableContainer}>
        <table className={`${styles.table} ${darkMode ? styles.darkTable : ''}`}>
          <thead className={`${styles.thead} ${darkMode ? styles.darkThead : ''}`}>
            <tr>
              <th className={`${styles.th}`}>שם</th>
              <th className={`${styles.th}`}>מייל</th>
              <th className={`${styles.th}`}>תפקיד</th>
              <th className={`${styles.th}`}>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) =>
              member.userId ? (
                <tr key={member.userId._id} className={styles.row}>
                  <td className={styles.td}>{member.userId.name}</td>
                  <td className={styles.td}>{member.userId.email}</td>
                  <td className={styles.td}>
                    <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                      {member.role === 'admin' ? '🛡️ מנהל' : '👤 חבר'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button
                      className={`${styles.actionButton} ${darkMode ? styles.darkActionButton : ''}`}
                      onClick={() =>
                        handleRoleChange(
                          member.userId.email,
                          member.role === 'admin' ? 'member' : 'admin'
                        )
                      }
                    >
                      {member.role === 'admin' ? 'הסר ניהול' : 'הפוך למנהל'}
                    </button>
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile grid */}
      <div className={styles.cardList}>
        {members.map((member) =>
          member.userId ? (
            <div key={member.userId._id} className={styles.card}>
              <p><strong>שם:</strong> {member.userId.name}</p>
              <p><strong>מייל:</strong> {member.userId.email}</p>
              <p>
                <strong>תפקיד:</strong>{' '}
                <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                  {member.role === 'admin' ? '🛡️ מנהל' : '👤 חבר'}
                </span>
              </p>
              <button
                className={`${styles.actionButton} ${darkMode ? styles.darkActionButton : ''}`}
                onClick={() =>
                  handleRoleChange(
                    member.userId.email,
                    member.role === 'admin' ? 'member' : 'admin'
                  )
                }
              >
                {member.role === 'admin' ? 'הסר ניהול' : 'הפוך למנהל'}
              </button>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
