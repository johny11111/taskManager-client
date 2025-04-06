import { useEffect, useState, useContext } from 'react';
import { getTeams, createTeam } from '../../api/teams';
import { useNavigate } from 'react-router-dom';
import styles from "./TeamsPage.module.css";
import { UserContext } from '../../context/UserContext';


const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const { user, darkMode } = useContext(UserContext);
  const navigate = useNavigate();

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
      alert("🛑 יש להזין שם לצוות!");
      return;
    }

    try {
      const data = await createTeam({ name: teamName });
      setTeams(prev => [...prev, data.team]);

      setTeamName('');
    } catch (error) {
      alert("❌ שגיאה ביצירת צוות");
    }
  };


  const deleteTeam = async (teamId) => {
    const confirmDelete = window.confirm("❗ האם אתה בטוח שברצונך למחוק את הצוות?");
    if (!confirmDelete) return;


    const res = await fetch(`https://taskmanager-server-ygfb.onrender.com/api/users/teams/${teamId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',

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
      <ul className={styles.teamList}>
        {teams.map(team => (
          <li key={team._id} className={styles.teamItem}>
            <span
              onClick={() => navigate(`/dashboard/${team._id}`)}
              className={styles.teamName}
            >
              {team.name} 🏢 ({team.members?.length} חברים)
            </span>
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
    </div>
  );

};

export default TeamsPage;
