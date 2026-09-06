import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../Lib/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (email, password) => {
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
        const response = await api.post('/login', { email, password });
        setUser(response.data.user);
        return response.data.user;
    };

    const logout = async () => {
        await api.post('/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}