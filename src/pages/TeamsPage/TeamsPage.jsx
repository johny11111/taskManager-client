import { useEffect, useState, useContext } from 'react';
import { getTeams } from '../../api/teams';
import { useNavigate } from 'react-router-dom';
import styles from "./TeamsPage.module.css";
import { UserContext } from '../../context/UserContext';


const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const { user , darkMode } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

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
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskmanager-server-ygfb.onrender.com/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: teamName })
      });

      const text = await response.text();
      if (!text) throw new Error("Empty response from server");

      const data = JSON.parse(text);

      if (response.ok) {
        setTeams(prev => [...prev, data.team]);
        setTeamName('');
      } else {
        alert(`🚨 שגיאה: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error creating team:", error);
      alert("❌ שגיאה בחיבור לשרת");
    }
  };

  const deleteTeam = async (teamId) => {
    const confirmDelete = window.confirm("❗ האם אתה בטוח שברצונך למחוק את הצוות?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`https://taskmanager-server-ygfb.onrender.com/api/users/teams/${teamId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
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
  
            {team.createdBy === user?.id && (
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
