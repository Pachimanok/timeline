import React, { useEffect, useRef } from 'react';
import { formatHistoricDate } from './TimelineCanvas.jsx';
import TagChip from './TagChip.jsx';

export default function EventDetailPopover({ event, anchorRect, onEdit, onClose }) {
    const popoverRef = useRef(null);

    useEffect(() => {
        if (!event || !anchorRect) return;
        const pop = popoverRef.current;
        if (!pop) return;
        pop.style.left = `${Math.min(anchorRect.left, window.innerWidth - 360)}px`;
        pop.style.top = `${Math.max(anchorRect.bottom + 10, 10)}px`;
    }, [event, anchorRect]);

    // Close on outside click
    useEffect(() => {
        if (!event) return;
        const handle = (e) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target) &&
                !e.target.closest('.timeline-event-point, .timeline-event-range')
            ) {
                onClose();
            }
        };
        document.addEventListener('click', handle);
        return () => document.removeEventListener('click', handle);
    }, [event, onClose]);

    if (!event) return null;

    const startFmt = formatHistoricDate(event.start_year, event.start_month, event.start_day, event.start_era || 'DC');
    const endFmt = event.end_year
        ? formatHistoricDate(event.end_year, event.end_month, event.end_day, event.end_era || 'DC')
        : null;

    return (
        <div ref={popoverRef} className="event-detail-popover glass-card">
            <div className="detail-header">
                <h4>{event.title}</h4>
                <div className="detail-actions">
                    <button className="btn btn-ghost btn-sm" title="Editar" onClick={onEdit}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
            <p className="detail-dates">{endFmt ? `${startFmt} → ${endFmt}` : startFmt}</p>
            {event.description && <p className="detail-description">{event.description}</p>}
            {event.image_url && (
                <div className="detail-image">
                    <img src={event.image_url} alt="" />
                </div>
            )}
            <div className="tag-chips">
                {event.tags?.map((t) => (
                    <TagChip key={t.id} tag={t} selected style={{ fontSize: '0.75rem' }} />
                ))}
            </div>
        </div>
    );
}
