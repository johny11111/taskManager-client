import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx';

createRoot(document.getElementById('root')).render(
  
     <>
    <UserProvider>
      <App />
    </UserProvider>
  
  </>,
)
