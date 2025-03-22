import { createContext, useContext } from 'react';

export const UserContext = createContext();

export const useUser = () => useContext(UserContext); // הוק נוח לשימוש
