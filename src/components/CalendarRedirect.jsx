import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CalendarRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isConnected = params.get("calendar_connected");

    if (isConnected) {
      localStorage.setItem("calendar_connected", "true");
    }

    navigate('/teams');
  }, []);

  return <p>מעבד חיבור ליומן...</p>;
};

export default CalendarRedirect;
