import React, { useState, useRef } from 'react';

export default function TagManagerModal({ open, tags, onClose, onAdd, onEdit, onDelete }) {
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#6366f1');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');

    if (!open) return null;

    const handleAdd = async () => {
        setError('');
        if (!newName.trim()) return;
        try {
            await onAdd(newName.trim(), newColor);
            setNewName('');
            setNewColor('#6366f1');
        } catch (err) {
            setError(err.message);
        }
    };

    const startEdit = (tag) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
        setError('');
    };

    const saveEdit = async () => {
        if (!editName.trim()) return;
        try {
            await onEdit(editingId, editName.trim(), editColor);
            setEditingId(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const cancelEdit = () => setEditingId(null);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Eliminar la etiqueta "${name}"? Se quitará de todos los eventos.`)) return;
        try {
            await onDelete(id);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="modal glass-card">
                <div className="modal-header">
                    <h3>Administrar Etiquetas</h3>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="tag-create-row">
                        <input
                            type="text"
                            className="tag-input"
                            placeholder="Nueva etiqueta..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                        />
                        <input
                            type="color"
                            className="tag-color-picker"
                            title="Color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleAdd}>Agregar</button>
                    </div>
                    {error && <p className="form-error">{error}</p>}

                    <div className="tag-list">
                        {tags.map((tag) =>
                            editingId === tag.id ? (
                                <div key={tag.id} className="tag-list-item tag-list-item-editing">
                                    <input
                                        type="color"
                                        className="tag-color-picker"
                                        value={editColor}
                                        onChange={(e) => setEditColor(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="tag-input tag-edit-input"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                        autoFocus
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={saveEdit} title="Guardar">✓</button>
                                    <button className="btn btn-ghost btn-sm" onClick={cancelEdit} title="Cancelar">✕</button>
                                </div>
                            ) : (
                                <div key={tag.id} className="tag-list-item">
                                    <div className="tag-swatch" style={{ background: tag.color }} />
                                    <span className="tag-list-name">{tag.name}</span>
                                    <button
                                        className="btn btn-ghost btn-sm tag-action-btn"
                                        title="Editar"
                                        onClick={() => startEdit(tag)}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm tag-action-btn tag-delete-btn"
                                        title="Eliminar"
                                        onClick={() => handleDelete(tag.id, tag.name)}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            <path d="M10 11v6" /><path d="M14 11v6" />
                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
