import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = api.getStoredUser();
        if (stored) {
            api.getMe()
                .then((user) => {
                    api.setStoredUser(user);
                    setCurrentUser(user);
                })
                .catch(() => {
                    api.clearToken();
                    api.clearStoredUser();
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { token, user } = await api.login(email, password);
        api.setToken(token);
        api.setStoredUser(user);
        setCurrentUser(user);
    };

    const register = async (username, email, password) => {
        const { token, user } = await api.register(username, email, password);
        api.setToken(token);
        api.setStoredUser(user);
        setCurrentUser(user);
    };

    const logout = () => {
        api.clearToken();
        api.clearStoredUser();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
