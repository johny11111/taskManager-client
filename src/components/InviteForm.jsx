import { useState } from 'react';
import axios from 'axios';

function InviteForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const sendInvite = async () => {
    try {
      const token = localStorage.getItem('token'); 

      const res = await axios.post('https://taskmanager-client-2pyw.onrender.com/api/users/invite', { email }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending invite');
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="הזן מייל להזמנה"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={sendInvite}>שלח הזמנה</button>
      <p>{message}</p>
    </div>
  );
}

export default InviteForm;
