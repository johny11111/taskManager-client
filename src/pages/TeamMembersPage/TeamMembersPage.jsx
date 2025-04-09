import { useParams, useNavigate } from 'react-router-dom';
import TeamMembersTable from '../../components/TeamAdminsManager/TeamAdminsManager';
import styles from './TeamMembersPage.module.css';
import { FaArrowRight } from 'react-icons/fa';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

export default function TeamMembersPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useContext(UserContext); // ⬅️ מצב כהה

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.dark : ''}`}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <FaArrowRight className={styles.backIcon} />
        חזור
      </button>

      <h1 className={styles.title}>ניהול חברי צוות</h1>
      <TeamMembersTable teamId={teamId} />
    </div>
  );
}
