import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function AuthPage() {
    const { login, register } = useAuth();
    const [tab, setTab] = useState('login');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regError, setRegError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            await login(loginEmail, loginPassword);
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        try {
            await register(regUsername, regEmail, regPassword);
        } catch (err) {
            setRegError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-brand">
                    <div className="auth-logo">
                        <Logo size={48} />
                    </div>
                    <h1>Timeline</h1>
                    <p className="auth-subtitle">Tu línea del tiempo personal</p>
                </div>

                <div className="auth-card glass-card">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
                            onClick={() => setTab('login')}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
                            onClick={() => setTab('register')}
                        >
                            Registrarse
                        </button>
                    </div>

                    {tab === 'login' && (
                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="login-email">Email</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="login-password">Contraseña</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full">
                                <span>Entrar</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                            {loginError && <p className="form-error">{loginError}</p>}
                        </form>
                    )}

                    {tab === 'register' && (
                        <form className="auth-form" onSubmit={handleRegister}>
                            <div className="form-group">
                                <label htmlFor="register-username">Usuario</label>
                                <input
                                    id="register-username"
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    required
                                    value={regUsername}
                                    onChange={(e) => setRegUsername(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="register-email">Email</label>
                                <input
                                    id="register-email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="register-password">Contraseña</label>
                                <input
                                    id="register-password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full">
                                <span>Crear Cuenta</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <line x1="19" y1="8" x2="19" y2="14" />
                                    <line x1="22" y1="11" x2="16" y2="11" />
                                </svg>
                            </button>
                            {regError && <p className="form-error">{regError}</p>}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
