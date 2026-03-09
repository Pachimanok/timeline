import React, { useState, useEffect } from 'react';
import EraToggle from './EraToggle.jsx';
import MonthSelect from './MonthSelect.jsx';
import TagChip from './TagChip.jsx';

const EMPTY_FORM = {
    title: '',
    description: '',
    start_year: '',
    start_month: '',
    start_day: '',
    start_era: 'DC',
    end_year: '',
    end_month: '',
    end_day: '',
    end_era: 'DC',
    image_url: '',
};

export default function EventModal({ open, event, tags, onSave, onDelete, onClose }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (open) {
            if (event) {
                setForm({
                    title: event.title || '',
                    description: event.description || '',
                    start_year: event.start_year ?? '',
                    start_month: event.start_month ?? '',
                    start_day: event.start_day ?? '',
                    start_era: event.start_era || 'DC',
                    end_year: event.end_year ?? '',
                    end_month: event.end_month ?? '',
                    end_day: event.end_day ?? '',
                    end_era: event.end_era || 'DC',
                    image_url: event.image_url || '',
                });
                setSelectedTagIds(event.tags?.map((t) => t.id) || []);
            } else {
                setForm(EMPTY_FORM);
                setSelectedTagIds([]);
            }
            setImageError(false);
        }
    }, [open, event]);

    if (!open) return null;

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    const setField = (field, val) => setForm((f) => ({ ...f, [field]: val }));

    const toggleTag = (id) => {
        setSelectedTagIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            title: form.title.trim(),
            description: form.description.trim(),
            start_year: parseInt(form.start_year),
            start_month: form.start_month || null,
            start_day: form.start_day || null,
            start_era: form.start_era,
            end_year: form.end_year ? parseInt(form.end_year) : null,
            end_month: form.end_month || null,
            end_day: form.end_day || null,
            end_era: form.end_era,
            image_url: form.image_url.trim() || null,
            tag_ids: selectedTagIds,
        };
        if (!data.title || !data.start_year) return;
        onSave(data, event?.id || null);
        onClose();
    };

    const handleDelete = () => {
        if (event && window.confirm('¿Eliminar este evento?')) {
            onDelete(event.id);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal glass-card">
                <div className="modal-header">
                    <h3>{event ? 'Editar Evento' : 'Nuevo Evento'}</h3>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Título *</label>
                        <input type="text" placeholder="Nombre del evento" required value={form.title} onChange={set('title')} />
                    </div>
                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea rows="3" placeholder="Descripción del evento..." value={form.description} onChange={set('description')} />
                    </div>

                    <fieldset className="date-fieldset">
                        <legend>Fecha inicio *</legend>
                        <div className="date-fields-row">
                            <div className="form-group form-group-sm">
                                <label>Año *</label>
                                <input type="number" min="1" placeholder="Ej: 44" required value={form.start_year} onChange={set('start_year')} />
                            </div>
                            <div className="form-group form-group-sm">
                                <label>Mes</label>
                                <MonthSelect value={form.start_month} onChange={(v) => setField('start_month', v)} />
                            </div>
                            <div className="form-group form-group-sm">
                                <label>Día</label>
                                <input type="number" min="1" max="31" placeholder="—" value={form.start_day} onChange={set('start_day')} />
                            </div>
                            <div className="form-group form-group-sm">
                                <label>Era</label>
                                <EraToggle value={form.start_era} onChange={(v) => setField('start_era', v)} />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="date-fieldset">
                        <legend>Fecha fin <small>(opcional: rango)</small></legend>
                        <div className="date-fields-row">
                            <div className="form-group form-group-sm">
                                <label>Año</label>
                                <input type="number" min="1" placeholder="—" value={form.end_year} onChange={set('end_year')} />
                            </div>
                            <div className="form-group form-group-sm">
                                <label>Mes</label>
                                <MonthSelect value={form.end_month} onChange={(v) => setField('end_month', v)} />
                            </div>
                            <div className="form-group form-group-sm">
                                <label>Día</label>
                                <input type="number" min="1" max="31" placeholder="—" value={form.end_day} onChange={set('end_day')} />
                            </div>
                            <div className="form-group form-group-sm">
                                <label>Era</label>
                                <EraToggle value={form.end_era} onChange={(v) => setField('end_era', v)} />
                            </div>
                        </div>
                    </fieldset>

                    <div className="form-group">
                        <label>URL de imagen <small>(opcional)</small></label>
                        <input type="url" placeholder="https://..." value={form.image_url} onChange={(e) => { set('image_url')(e); setImageError(false); }} />
                        {form.image_url && !imageError && (
                            <div className="image-preview">
                                <img src={form.image_url} alt="Preview" onError={() => setImageError(true)} />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Etiquetas</label>
                        <div className="tag-selector">
                            {tags.map((tag) => (
                                <TagChip
                                    key={tag.id}
                                    tag={tag}
                                    selected={selectedTagIds.includes(tag.id)}
                                    onClick={() => toggleTag(tag.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        {event && (
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                Eliminar
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
