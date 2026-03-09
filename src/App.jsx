import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import TimelinePage from './pages/TimelinePage.jsx';

function AppRoutes() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Cargando…</div>
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/"
                element={currentUser ? <TimelinePage /> : <AuthPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
