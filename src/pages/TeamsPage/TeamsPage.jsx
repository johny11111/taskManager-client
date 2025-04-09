import { useEffect, useState, useContext } from 'react';
import { getTeams, createTeam } from '../../api/teams';
import { useNavigate } from 'react-router-dom';
import styles from "./TeamsPage.module.css";
import { UserContext } from '../../context/UserContext';
import toast from 'react-hot-toast';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const { user, darkMode } = useContext(UserContext);
  const navigate = useNavigate();
  const API_URL = 'https://taskmanager-server-ygfb.onrender.com';

  useEffect(() => {
    if (user?._id) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    const data = await getTeams();
    setTeams(data);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error("🛑 יש להזין שם לצוות!");
      return;
    }

    try {
      const data = await createTeam({ name: teamName });
      setTeams(prev => [...prev, data.team]);
      setTeamName('');
      toast.success('✅ צוות נוצר בהצלחה!');
    } catch (error) {
      toast.error("❌ שגיאה ביצירת צוות");
    }
  };

  const deleteTeam = async (teamId) => {
    const confirmDelete = window.confirm("❗ האם אתה בטוח שברצונך למחוק את הצוות?");
    if (!confirmDelete) return;

    const res = await fetch(`${API_URL}/api/users/teams/${teamId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("🗑 הצוות נמחק בהצלחה");
      setTeams(teams.filter(t => t._id !== teamId));
    } else {
      toast.error(`❌ שגיאה: ${data.message}`);
    }
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      <h1 className={styles.title}>🏢 ניהול צוותים</h1>

      <form onSubmit={handleCreateTeam} className={styles.form}>
        <label htmlFor="teamName">שם הצוות</label>
        <input
          id="teamName"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.createBtn}>➕ צור צוות</button>
      </form>

      <h3 className={styles.subTitle}>📋 הצוותים שלי</h3>

      {teams.length === 0 ? (
        <p className={styles.emptyMsg}>😶 עדיין אין לך צוותים. צור את הראשון!</p>
      ) : (
        <ul className={styles.teamList}>
          {teams.map((team, idx) => (
            <li
              key={team._id}
              className={styles.teamItem}
              style={{ '--i': idx }}
            >
              <div className={styles.teamInfo} onClick={() => navigate(`/dashboard/${team._id}`)}>
                <h4 className={styles.teamName}>{team.name}</h4>
                <p className={styles.teamMeta}>
                  👥 {team.members?.length || 0} חברים • {team.createdBy === user._id ? '🧑‍💼 מנהל' : '👤 חבר'}
                </p>
              </div>
              {team.createdBy?.toString() === user?._id && (
                <button
                  onClick={() => deleteTeam(team._id)}
                  className={styles.deleteBtn}
                >
                  🗑
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamsPage;
