import React from 'react';
import Logo from './Logo.jsx';
import * as api from '../api.js';

export default function Topbar({ currentUser, onAddEvent, onManageTags, onLogout, users, selectedUserId, onSelectUser }) {
    return (
        <header className="topbar glass-card">
            <div className="topbar-left">
                <Logo size={32} />
                <h2>Timeline</h2>
                {currentUser?.role === 'admin' && (
                    <div id="admin-user-select">
                        <select
                            className="select-input"
                            value={selectedUserId || ''}
                            onChange={(e) => onSelectUser(e.target.value || null)}
                        >
                            <option value="">— Mi línea —</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.username} ({u.role})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="topbar-right">
                <span className="user-badge">{currentUser?.username} ({currentUser?.role})</span>
                <button className="btn btn-ghost btn-icon" title="Administrar etiquetas" onClick={onManageTags}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span>Etiquetas</span>
                </button>
                <button className="btn btn-primary btn-icon" title="Agregar evento" onClick={onAddEvent}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Nuevo Evento</span>
                </button>
                <button className="btn btn-ghost btn-icon" title="Cerrar sesión" onClick={onLogout}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16,17 21,12 16,7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
